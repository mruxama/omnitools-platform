import {
  WatermarkLayer,
  VideoTimingConfig,
  ExportOptions,
} from "./types";
import { renderWatermarkLayer } from "./imageProcessor";
import { calculateWatermarkAlpha } from "./coordinates";

export interface VideoProcessingProgress {
  currentTime: number;
  duration: number;
  percentage: number;
}

/**
 * Checks supported video mime types for in-browser recording.
 */
export function getSupportedVideoMimeType(preferred?: "original" | "video/mp4" | "video/webm"): string {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "video/webm";
  }

  const candidates = [
    preferred === "video/mp4" ? "video/mp4" : null,
    "video/mp4;codecs=avc1",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ].filter(Boolean) as string[];

  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }

  return "video/webm";
}

/**
 * Processes a video file in-browser, applying watermark layers frame-by-frame,
 * preserving the audio track through Web Audio API, and exporting a real video blob.
 */
export async function processVideoWithWatermarks(
  file: File,
  layers: WatermarkLayer[],
  timing: VideoTimingConfig,
  exportOptions: ExportOptions,
  onProgress?: (progress: VideoProcessingProgress) => void,
  isCancelled?: () => boolean
): Promise<{ blob: Blob; mimeType: string; duration: number }> {
  return new Promise(async (resolve, reject) => {
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = false; // muted false so audio node can tap it
    video.playsInline = true;
    video.preload = "auto";

    // Clean up helper
    const cleanup = () => {
      URL.revokeObjectURL(videoUrl);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video file"));
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 1;
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          cleanup();
          reject(new Error("Unable to create canvas 2D context for video"));
          return;
        }

        // Set up Web Audio API to preserve audio tracks
        let audioContext: AudioContext | null = null;
        let audioDestination: MediaStreamAudioDestinationNode | null = null;
        let audioSource: MediaElementAudioSourceNode | null = null;

        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioContext = new AudioContextClass();
            audioDestination = audioContext.createMediaStreamDestination();
            audioSource = audioContext.createMediaElementSource(video);
            audioSource.connect(audioDestination);
            // Also connect to silent or low gain so it doesn't blast user speakers during processing
            const gain = audioContext.createGain();
            gain.gain.value = 0.0;
            audioSource.connect(gain);
            gain.connect(audioContext.destination);
          }
        } catch (audioErr) {
          console.warn("AudioContext setup warning (processing will continue):", audioErr);
        }

        // Capture canvas stream at 30 fps
        const canvasStream = canvas.captureStream(30);

        // If audio tracks exist in destination, add to stream
        if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
          audioDestination.stream.getAudioTracks().forEach((track) => {
            canvasStream.addTrack(track);
          });
        }

        const mimeType = getSupportedVideoMimeType(exportOptions.videoFormat);
        const recordedChunks: Blob[] = [];

        let mediaRecorder: MediaRecorder;
        try {
          mediaRecorder = new MediaRecorder(canvasStream, {
            mimeType,
            videoBitsPerSecond: exportOptions.videoQuality === "high" ? 6_000_000 : 2_500_000,
          });
        } catch {
          mediaRecorder = new MediaRecorder(canvasStream);
        }

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          cleanup();
          if (audioContext) {
            audioContext.close().catch(() => {});
          }

          if (isCancelled && isCancelled()) {
            reject(new Error("Video processing was cancelled"));
            return;
          }

          const finalBlob = new Blob(recordedChunks, { type: mimeType });
          resolve({ blob: finalBlob, mimeType, duration });
        };

        const logoCache = new Map<string, HTMLImageElement>();

        // Frame rendering loop
        let animFrameId: number;
        const renderFrame = async () => {
          if (isCancelled && isCancelled()) {
            cancelAnimationFrame(animFrameId);
            if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
            return;
          }

          if (video.ended || video.currentTime >= duration) {
            cancelAnimationFrame(animFrameId);
            if (mediaRecorder.state !== "inactive") {
              mediaRecorder.stop();
            }
            return;
          }

          // Draw current video frame
          ctx.drawImage(video, 0, 0, width, height);

          // Calculate layer alpha considering video timing
          const currentTime = video.currentTime;
          for (const layer of layers) {
            if (!layer.visible) continue;
            const effectiveAlpha = calculateWatermarkAlpha(layer.opacity, currentTime, timing);
            if (effectiveAlpha > 0) {
              const layerWithAdjustedOpacity = {
                ...layer,
                opacity: Math.round(effectiveAlpha * 100),
              };
              await renderWatermarkLayer(ctx, layerWithAdjustedOpacity, width, height, logoCache);
            }
          }

          if (onProgress) {
            onProgress({
              currentTime,
              duration,
              percentage: Math.min(99, Math.round((currentTime / duration) * 100)),
            });
          }

          animFrameId = requestAnimationFrame(renderFrame);
        };

        // Start recording and playback
        mediaRecorder.start(250); // collect chunk every 250ms
        await video.play();
        renderFrame();
      } catch (err) {
        cleanup();
        reject(err);
      }
    };
  });
}
