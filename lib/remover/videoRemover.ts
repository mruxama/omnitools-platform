import { MaskRect, ObjectRemoverOptions } from "./imageInpainter";

export interface VideoLogoRemoverOptions {
  rects: MaskRect[];
  startTime: number;
  endTime: number;
  mode: "blur" | "pixelate" | "solid-fill";
  blurRadius?: number;
  pixelSize?: number;
  fillColor?: string;
  outputFormat: "video/mp4" | "video/webm";
}

/**
 * Removes or conceals a logo/watermark in a video by processing frame by frame
 * with live canvas transformation and capturing the output with MediaRecorder.
 */
export async function removeLogoFromVideo(
  file: File,
  options: VideoLogoRemoverOptions,
  onProgress?: (percent: number) => void,
  checkCancelled?: () => boolean
): Promise<{ blob: Blob; outputName: string; size: number }> {
  return new Promise(async (resolve, reject) => {
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = videoUrl;
    video.playsInline = true;
    video.preload = "auto";
    video.muted = false;

    let audioContext: AudioContext | null = null;
    let audioDestination: MediaStreamAudioDestinationNode | null = null;
    let audioSource: MediaElementAudioSourceNode | null = null;
    let recorder: MediaRecorder | null = null;
    let animId: number | null = null;

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
        const width = video.videoWidth;
        const height = video.videoHeight;
        const duration = video.duration || 1;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("Could not create 2D canvas context");

        let combinedStream: MediaStream;
        const canvasStream = canvas.captureStream(30);

        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioContext = new AudioContextClass();
            audioSource = audioContext.createMediaElementSource(video);
            audioDestination = audioContext.createMediaStreamDestination();
            audioSource.connect(audioDestination);
            const audioTrack = audioDestination.stream.getAudioTracks()[0];
            if (audioTrack) {
              canvasStream.addTrack(audioTrack);
            }
          }
        } catch {
          // Fall back to silent canvas capture if cross-origin audio cannot be connected
        }

        combinedStream = canvasStream;

        let mimeType: string = options.outputFormat;
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm;codecs=vp9";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "video/webm";
          }
        }

        recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 2_500_000,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          cleanup();
          const finalBlob = new Blob(chunks, { type: mimeType });
          const dot = file.name.lastIndexOf(".");
          const base = dot !== -1 ? file.name.substring(0, dot) : file.name;
          const ext = mimeType.includes("mp4") ? "mp4" : "webm";
          const outputName = `${base}_cleaned.${ext}`;

          resolve({
            blob: finalBlob,
            outputName,
            size: finalBlob.size,
          });
        };

        recorder.start(250);

        const drawFrame = () => {
          if (checkCancelled && checkCancelled()) {
            cleanup();
            reject(new Error("Operation cancelled"));
            return;
          }

          if (video.paused || video.ended) return;

          // 1. Draw base video frame
          ctx.drawImage(video, 0, 0, width, height);

          // 2. Check if current timestamp is within removal time range
          const currentTime = video.currentTime;
          if (currentTime >= options.startTime && currentTime <= options.endTime) {
            for (const rect of options.rects) {
              const { x, y, width: rw, height: rh } = rect;
              if (rw <= 0 || rh <= 0) continue;

              if (options.mode === "pixelate") {
                const pixelSize = options.pixelSize || 12;
                const sw = Math.max(1, Math.floor(rw / pixelSize));
                const sh = Math.max(1, Math.floor(rh / pixelSize));
                const temp = document.createElement("canvas");
                temp.width = sw;
                temp.height = sh;
                const tCtx = temp.getContext("2d");
                if (tCtx) {
                  tCtx.imageSmoothingEnabled = false;
                  tCtx.drawImage(canvas, x, y, rw, rh, 0, 0, sw, sh);
                  ctx.imageSmoothingEnabled = false;
                  ctx.drawImage(temp, 0, 0, sw, sh, x, y, rw, rh);
                  ctx.imageSmoothingEnabled = true;
                }
              } else if (options.mode === "solid-fill") {
                ctx.fillStyle = options.fillColor || "#000000";
                ctx.fillRect(x, y, rw, rh);
              } else {
                // blur concealment
                ctx.save();
                ctx.filter = `blur(${options.blurRadius || 16}px)`;
                ctx.drawImage(canvas, x, y, rw, rh, x, y, rw, rh);
                ctx.restore();
              }
            }
          }

          if (onProgress) {
            const pct = Math.min(99, Math.round((currentTime / duration) * 100));
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

        await video.play();
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video"));
    };
  });
}
