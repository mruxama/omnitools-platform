import { VideoAnalysisResult } from "./types";

/**
 * Parses binary ISO Base Media File Format (ISOBMFF / QuickTime / MP4) box headers
 * to detect video codec fourcc (avc1, hvc1, hev1, apcn/prores) and audio codec (mp4a, lpcm, etc.).
 */
export async function inspectVideoFile(file: File): Promise<VideoAnalysisResult> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "mov";
  const fileSize = file.size;

  // 1. Read first 64KB - 256KB to detect container and codec atoms
  const bufferSlice = await file.slice(0, Math.min(fileSize, 256 * 1024)).arrayBuffer();
  const bytes = new Uint8Array(bufferSlice);

  const detectedCodecs = parseIsoBmffAtoms(bytes);
  let videoCodec = detectedCodecs.videoCodec || "unknown";
  let audioCodec = detectedCodecs.audioCodec || "aac";

  // Check HTML5 video element for duration, dimensions, and visual thumbnail
  const elementMeta = await inspectViaHtml5Video(file).catch(() => null);

  const duration = elementMeta?.duration || 0;
  const width = elementMeta?.width || 1920;
  const height = elementMeta?.height || 1080;
  const fps = elementMeta?.fps || 30;
  const aspectRatio = +(width / Math.max(1, height)).toFixed(3);
  const thumbnailUrl = elementMeta?.thumbnailUrl;

  // Detect HDR indicators: iPhone HDR videos usually have HEVC + 10-bit color or dolby vision atoms
  const isHdr = detectedCodecs.isHdr || (videoCodec === "hevc" && (detectedCodecs.hasHdrAtom || false));

  // Determine Remux compatibility:
  // MP4 container natively supports H.264 (avc1), HEVC (hvc1/hev1), and AAC (mp4a) without re-encoding!
  // If video is ProRes or audio is uncompressed PCM, direct MP4 remuxing requires transcode or container adjust.
  let canRemuxToMp4 = true;
  let incompatibilityReason: string | undefined;

  if (videoCodec === "prores") {
    canRemuxToMp4 = false;
    incompatibilityReason = "Apple ProRes video requires transcoding to standard H.264/HEVC for MP4";
  } else if (audioCodec === "pcm" || audioCodec === "lpcm") {
    canRemuxToMp4 = false;
    incompatibilityReason = "PCM audio track requires AAC conversion for standard MP4 container";
  } else if (extension === "avi" || extension === "mkv") {
    // If codecs are already avc1/aac inside MKV, remux is possible, otherwise transcode
    if (videoCodec !== "h264" && videoCodec !== "hevc") {
      canRemuxToMp4 = false;
      incompatibilityReason = `Codec ${videoCodec} requires transcoding to H.264 for MP4 container`;
    }
  }

  const recommendedMode = canRemuxToMp4 ? "remux" : "transcode";

  return {
    filename: file.name,
    fileSize,
    duration,
    width,
    height,
    aspectRatio,
    fps,
    container: extension,
    videoCodec,
    audioCodec,
    isHdr,
    canRemuxToMp4,
    recommendedMode,
    incompatibilityReason,
    thumbnailUrl,
  };
}

/**
 * Searches for key codec markers in MP4/MOV header atoms
 */
function parseIsoBmffAtoms(bytes: Uint8Array): {
  videoCodec?: string;
  audioCodec?: string;
  isHdr?: boolean;
  hasHdrAtom?: boolean;
} {
  const result: {
    videoCodec?: string;
    audioCodec?: string;
    isHdr?: boolean;
    hasHdrAtom?: boolean;
  } = {};

  const ascii = (offset: number, len: number) => {
    let str = "";
    for (let i = 0; i < len; i++) {
      if (offset + i < bytes.length) {
        str += String.fromCharCode(bytes[offset + i]);
      }
    }
    return str;
  };

  // Convert array buffer to binary string for fast pattern search
  let binStr = "";
  const len = Math.min(bytes.length, 128 * 1024);
  for (let i = 0; i < len; i++) {
    binStr += String.fromCharCode(bytes[i]);
  }

  // Check video codec markers
  if (binStr.includes("hvc1") || binStr.includes("hev1")) {
    result.videoCodec = "hevc";
  } else if (binStr.includes("avc1") || binStr.includes("avc3")) {
    result.videoCodec = "h264";
  } else if (binStr.includes("apcn") || binStr.includes("apch") || binStr.includes("apcs") || binStr.includes("apco")) {
    result.videoCodec = "prores";
  } else if (binStr.includes("vp09") || binStr.includes("vp08")) {
    result.videoCodec = "vp9";
  } else if (binStr.includes("av01")) {
    result.videoCodec = "av1";
  }

  // Check audio codec markers
  if (binStr.includes("mp4a")) {
    result.audioCodec = "aac";
  } else if (binStr.includes("sowt") || binStr.includes("twos") || binStr.includes("in24") || binStr.includes("lpcm")) {
    result.audioCodec = "pcm";
  } else if (binStr.includes("Opus") || binStr.includes("opus")) {
    result.audioCodec = "opus";
  } else if (binStr.includes(".mp3")) {
    result.audioCodec = "mp3";
  }

  // Check HDR / Dolby Vision markers
  if (binStr.includes("dvh1") || binStr.includes("dvhe") || binStr.includes("colr") && binStr.includes("nclx")) {
    result.isHdr = true;
    result.hasHdrAtom = true;
  }

  return result;
}

/**
 * Extracts metadata and thumbnail via HTML5 video element where readable
 */
function inspectViaHtml5Video(file: File): Promise<{
  width: number;
  height: number;
  duration: number;
  fps: number;
  thumbnailUrl?: string;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;
      const duration = video.duration || 0;

      // Extract quick thumbnail
      const seekTime = Math.min(1.0, duration * 0.1);
      video.currentTime = seekTime;

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          const tw = 240;
          const th = Math.round((tw * height) / Math.max(1, width));
          canvas.width = tw;
          canvas.height = th;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, tw, th);
          }
          const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.65);
          URL.revokeObjectURL(url);
          resolve({ width, height, duration, fps: 30, thumbnailUrl });
        } catch {
          URL.revokeObjectURL(url);
          resolve({ width, height, duration, fps: 30 });
        }
      };

      // Fallback if seeked doesn't fire
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve({ width, height, duration, fps: 30 });
      }, 500);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read via HTML5 video element"));
    };
  });
}
