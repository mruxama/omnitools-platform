export type RotationAngle = 0 | 90 | 180 | 270;

export interface VideoRotationOptions {
  angle: RotationAngle; // 90 (clockwise), 180, 270 (-90 counterclockwise)
  flipHorizontal: boolean;
  flipVertical: boolean;
  outputFormat: "video/mp4" | "video/webm";
  videoBitrate?: number; // bps
}

export interface VideoRotationResult {
  blob: Blob;
  outputName: string;
  width: number;
  height: number;
  duration: number;
  size: number;
}

export interface VideoSourceMetadata {
  width: number;
  height: number;
  duration: number;
  aspectRatio: number;
}

/**
 * Extracts video dimension & duration metadata.
 */
export async function inspectVideo(file: File): Promise<VideoSourceMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      const duration = video.duration || 0;
      URL.revokeObjectURL(url);
      resolve({
        width,
        height,
        duration,
        aspectRatio: +(width / height).toFixed(3),
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read video metadata"));
    };
  });
}

/**
 * Rotates video frames physically with canvas transformation, maintaining aspect ratio,
 * proper dimensions swap (e.g. 1920x1080 -> 1080x1920 for 90°/270°), and preserving audio.
 */
export async function rotateVideoPhysically(
  file: File,
  options: VideoRotationOptions,
  onProgress?: (percent: number) => void,
  checkCancelled?: () => boolean
): Promise<VideoRotationResult> {
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
        const origW = video.videoWidth;
        const origH = video.videoHeight;
        const duration = video.duration || 1;

        // Determine rotated output dimensions
        const isSwapped = options.angle === 90 || options.angle === 270;
        const outW = isSwapped ? origH : origW;
        const outH = isSwapped ? origW : origH;

        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("Could not create 2D canvas context");

        // Set up Audio tapping
        let combinedStream: MediaStream;
        const canvasStream = canvas.captureStream(30);

        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioContext = new AudioContextClass();
            audioSource = audioContext.createMediaElementSource(video);
            audioDestination = audioContext.createMediaStreamDestination();
            audioSource.connect(audioDestination);
            // also connect to destination so user doesn't get deafened or audio lost
            const audioTrack = audioDestination.stream.getAudioTracks()[0];
            if (audioTrack) {
              canvasStream.addTrack(audioTrack);
            }
          }
        } catch {
          // Audio extraction might be restricted by CORS on file blobs; continue with canvas stream
        }

        combinedStream = canvasStream;

        // Choose supported MIME type
        let mimeType: string = options.outputFormat;
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm;codecs=vp9";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "video/webm";
          }
        }

        const bitrate = options.videoBitrate || 2_500_000;
        recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: bitrate,
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
          const outputName = `${base}_rotated_${options.angle}deg.${ext}`;

          resolve({
            blob: finalBlob,
            outputName,
            width: outW,
            height: outH,
            duration,
            size: finalBlob.size,
          });
        };

        recorder.start(250);

        // Drawing loop
        const drawFrame = () => {
          if (checkCancelled && checkCancelled()) {
            cleanup();
            reject(new Error("Operation cancelled"));
            return;
          }

          if (video.paused || video.ended) return;

          ctx.save();
          ctx.translate(outW / 2, outH / 2);

          // Apply rotation
          const rad = (options.angle * Math.PI) / 180;
          ctx.rotate(rad);

          // Apply flips
          const scaleX = options.flipHorizontal ? -1 : 1;
          const scaleY = options.flipVertical ? -1 : 1;
          ctx.scale(scaleX, scaleY);

          // Draw original image centered
          ctx.drawImage(video, -origW / 2, -origH / 2, origW, origH);
          ctx.restore();

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
