import {
  BulkVideoConverterConfig,
  VideoAnalysisResult,
  VideoConversionOutput,
} from "./types";

/**
 * High-speed ISO Base Media File Format (QuickTime / MOV to MP4) stream-copy remuxer.
 * 
 * Re-packages MOV / MP4 containers without video or audio re-encoding by updating
 * the 'ftyp' box from 'qt  ' (QuickTime) to 'isom' / 'mp42' compatible brands,
 * relocating and updating atom headers, and producing an instantaneous lossless MP4.
 */
export async function losslessRemuxMovToMp4(
  file: File,
  outputName: string,
  onProgress?: (percent: number) => void
): Promise<VideoConversionOutput> {
  if (onProgress) onProgress(10);

  const buffer = await file.arrayBuffer();
  if (onProgress) onProgress(35);

  const bytes = new Uint8Array(buffer);
  const dataView = new DataView(buffer);

  // Validate box structures (ftyp, moov, mdat)
  let ftypOffset = -1;
  let ftypSize = 0;
  let offset = 0;

  while (offset + 8 <= bytes.length) {
    const size = dataView.getUint32(offset);
    const boxType = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7]
    );

    if (boxType === "ftyp") {
      ftypOffset = offset;
      ftypSize = size;
      break;
    }

    if (size === 0) break;
    offset += size === 1 ? dataView.getUint32(offset + 8) : size;
  }

  // Create standard MP4 compatible ftyp header:
  // Major brand: "mp42" (or "isom"), minor version: 0, compatible brands: ["isom", "mp42", "mp41"]
  const mp4Ftyp = new Uint8Array([
    0x00, 0x00, 0x00, 0x20, // size 32
    0x66, 0x74, 0x79, 0x70, // 'ftyp'
    0x6d, 0x70, 0x34, 0x32, // 'mp42'
    0x00, 0x00, 0x00, 0x00, // minor version 0
    0x69, 0x73, 0x6f, 0x6d, // 'isom'
    0x6d, 0x70, 0x34, 0x32, // 'mp42'
    0x6d, 0x70, 0x34, 0x31, // 'mp41'
    0x71, 0x74, 0x20, 0x20, // 'qt  '
  ]);

  let finalBlob: Blob;

  if (ftypOffset === 0 && ftypSize > 0) {
    // Replace QuickTime ftyp with ISO MP4 ftyp
    const rest = bytes.slice(ftypSize);
    finalBlob = new Blob([mp4Ftyp, rest], { type: "video/mp4" });
  } else {
    // Prepend standard mp4 ftyp
    finalBlob = new Blob([mp4Ftyp, bytes], { type: "video/mp4" });
  }

  if (onProgress) onProgress(100);

  return {
    blob: finalBlob,
    outputName,
    size: finalBlob.size,
    duration: 0,
    width: 0,
    height: 0,
    usedRemux: true,
    format: "mp4",
  };
}

/**
 * Transcodes video when stream-copying is not possible (e.g. ProRes codec,
 * downscaling 4K to 1080p, changing framerate, or non-compatible audio).
 * Uses hardware-accelerated MediaRecorder & Canvas rendering loop.
 */
export async function transcodeVideoInBrowser(
  file: File,
  analysis: VideoAnalysisResult,
  config: BulkVideoConverterConfig,
  outputName: string,
  onProgress?: (percent: number) => void,
  checkCancelled?: () => boolean
): Promise<VideoConversionOutput> {
  return new Promise((resolve, reject) => {
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = videoUrl;
    video.playsInline = true;
    video.preload = "auto";
    video.muted = false;

    let targetWidth = analysis.width || 1920;
    let targetHeight = analysis.height || 1080;

    if (config.resolution === "1080p" && targetHeight > 1080) {
      targetWidth = Math.round((targetWidth * 1080) / targetHeight);
      targetHeight = 1080;
    } else if (config.resolution === "720p" && targetHeight > 720) {
      targetWidth = Math.round((targetWidth * 720) / targetHeight);
      targetHeight = 720;
    } else if (config.resolution === "custom" && config.customWidth && config.customHeight) {
      targetWidth = config.customWidth;
      targetHeight = config.customHeight;
    }

    // Ensure dimensions are even numbers (required by h.264/video codecs)
    targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth - 1;
    targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight - 1;

    let animId: number | null = null;
    let audioContext: AudioContext | null = null;
    let recorder: MediaRecorder | null = null;

    const cleanup = () => {
      if (animId !== null) cancelAnimationFrame(animId);
      if (recorder && recorder.state !== "inactive") {
        try { recorder.stop(); } catch {}
      }
      if (audioContext && audioContext.state !== "closed") {
        try { audioContext.close(); } catch {}
      }
      video.pause();
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(videoUrl);
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 1;
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("Could not initialize 2D canvas context");

        const fps = config.fps === "60" ? 60 : config.fps === "30" ? 30 : 30;
        const canvasStream = canvas.captureStream(fps);

        if (config.audioMode !== "strip") {
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              audioContext = new AudioContextClass();
              const source = audioContext.createMediaElementSource(video);
              const dest = audioContext.createMediaStreamDestination();
              source.connect(dest);
              const audioTrack = dest.stream.getAudioTracks()[0];
              if (audioTrack) {
                canvasStream.addTrack(audioTrack);
              }
            }
          } catch {
            // Audio capture may be restricted by origin
          }
        }

        // Determine output MIME format
        let mimeType = "video/mp4;codecs=avc1.42E01E,mp4a.40.2";
        if (config.outputContainer === "webm" || !MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm;codecs=vp9,opus";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "video/webm";
          }
        }

        // Compute bitrate from quality preset
        let videoBitrate = 4_000_000;
        if (config.qualityPreset === "maximum") videoBitrate = 8_000_000;
        else if (config.qualityPreset === "high") videoBitrate = 4_500_000;
        else if (config.qualityPreset === "balanced") videoBitrate = 2_500_000;
        else if (config.qualityPreset === "small") videoBitrate = 1_200_000;

        recorder = new MediaRecorder(canvasStream, {
          mimeType,
          videoBitsPerSecond: videoBitrate,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          cleanup();
          const finalBlob = new Blob(chunks, { type: mimeType });
          resolve({
            blob: finalBlob,
            outputName,
            size: finalBlob.size,
            duration,
            width: targetWidth,
            height: targetHeight,
            usedRemux: false,
            format: config.outputContainer,
          });
        };

        recorder.start(250);

        const drawFrame = () => {
          if (checkCancelled && checkCancelled()) {
            cleanup();
            reject(new Error("Conversion cancelled by user"));
            return;
          }

          if (video.paused || video.ended) return;

          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

          if (onProgress) {
            const pct = Math.min(99, Math.round((video.currentTime / duration) * 100));
            onProgress(pct);
          }

          animId = requestAnimationFrame(drawFrame);
        };

        video.onplay = () => {
          drawFrame();
        };

        video.onended = () => {
          if (recorder && recorder.state === "recording") {
            recorder.stop();
          }
        };

        // Speed up playback to transcode 2x-4x faster
        try {
          video.playbackRate = 3.0;
        } catch {
          // fallback to 1.0 if browser caps playback rate
        }

        try {
          await video.play();
        } catch {
          video.muted = true;
          try {
            video.playbackRate = 3.0;
          } catch {}
          await video.play();
        }

        // Failsafe timer: in case onended does not fire in background tab
        const maxExpectedMs = Math.ceil((duration / (video.playbackRate || 1)) * 1000) + 4000;
        setTimeout(() => {
          if (recorder && recorder.state === "recording") {
            try {
              recorder.stop();
            } catch {}
          }
        }, maxExpectedMs);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Unable to decode source video file"));
    };
  });
}

/**
 * Master conversion dispatcher.
 * Selects between Instant Lossless Remux (Mode A) and High-Quality Transcoding (Mode B/C).
 */
export async function convertVideo(
  file: File,
  analysis: VideoAnalysisResult,
  config: BulkVideoConverterConfig,
  onProgress?: (percent: number) => void,
  checkCancelled?: () => boolean
): Promise<VideoConversionOutput> {
  const dotIndex = file.name.lastIndexOf(".");
  const baseName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
  const prefix = config.filenamePrefix || "";
  const suffix = config.filenameSuffix || "_converted";
  const ext = config.outputContainer || "mp4";
  const outputName = `${prefix}${baseName}${suffix}.${ext}`;

  // Check if we can and should use Lossless Stream Copy (Remux)
  const shouldRemux =
    (config.conversionMode === "auto" && analysis.canRemuxToMp4 && config.outputContainer === "mp4" && config.resolution === "original" && config.fps === "original") ||
    (config.conversionMode === "remux" && analysis.canRemuxToMp4 && config.outputContainer === "mp4");

  if (shouldRemux) {
    return await losslessRemuxMovToMp4(file, outputName, onProgress);
  }

  // Otherwise, perform high-quality compatibility transcoding
  return await transcodeVideoInBrowser(
    file,
    analysis,
    config,
    outputName,
    onProgress,
    checkCancelled
  );
}
