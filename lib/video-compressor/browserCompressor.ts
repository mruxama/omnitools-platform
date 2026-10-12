import { VideoMetadata, CompressionSettings } from './types';
import { calculateTargetDimensions, calculateBitrateForTargetSize } from './bitrateCalculator';

/**
 * Client-side video metadata extractor using HTML5 Video element.
 */
export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      const aspectRatio = height > 0 ? +(width / height).toFixed(3) : 1.777;
      const bitrate = duration > 0 ? Math.round((file.size * 8) / duration) : undefined;

      // Extract a preview thumbnail at 0.5s or 10%
      const seekTime = Math.min(1.0, duration * 0.1);
      video.currentTime = seekTime;

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          const thumbWidth = 320;
          const thumbHeight = Math.round(thumbWidth / (aspectRatio || 1.777));
          canvas.width = thumbWidth;
          canvas.height = thumbHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);
          }
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
          URL.revokeObjectURL(objectUrl);

          resolve({
            filename: file.name,
            fileSize: file.size,
            duration,
            width,
            height,
            aspectRatio,
            fps: 30, // Default estimate
            bitrate,
            thumbnailUrl,
          });
        } catch {
          URL.revokeObjectURL(objectUrl);
          resolve({
            filename: file.name,
            fileSize: file.size,
            duration,
            width,
            height,
            aspectRatio,
            fps: 30,
            bitrate,
          });
        }
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load video metadata. Format may not be decoded by this browser.'));
    };
  });
}

/**
 * Client-Side Video Compressor using HTML5 Video playback, Canvas captureStream,
 * Web Audio API, and MediaRecorder.
 * 
 * Works seamlessly across modern desktop & mobile browsers without heavy external WASM binaries,
 * encoding with real hardware-accelerated video/webm or video/mp4 codecs.
 */
export async function compressVideoInBrowser(
  file: File,
  metadata: VideoMetadata,
  settings: CompressionSettings,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; url: string; size: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = false;
    video.playsInline = true;

    // Calculate target dimensions
    const targetDims = calculateTargetDimensions(
      metadata.width,
      metadata.height,
      settings.targetResolution,
      settings.customWidth,
      settings.customHeight
    );

    // Calculate target bitrate
    let targetBitrateBps: number;
    if (settings.mode === 'target-size' && settings.targetSizeMB) {
      const bitrates = calculateBitrateForTargetSize(
        settings.targetSizeMB,
        metadata.duration,
        settings.audioBitrateKbps,
        settings.stripAudio
      );
      targetBitrateBps = bitrates.totalBitrateKbps * 1000;
    } else if (settings.mode === 'bitrate' && settings.videoBitrateKbps) {
      targetBitrateBps = (settings.videoBitrateKbps + (settings.stripAudio ? 0 : settings.audioBitrateKbps)) * 1000;
    } else {
      // Quality/CRF mode mapping:
      // CRF 18 ~ 4000 kbps (1080p), CRF 23 ~ 2200 kbps, CRF 28 ~ 1100 kbps, CRF 32 ~ 650 kbps
      const baseKbps = 2200;
      const crfScale = Math.pow(2, (23 - settings.crf) / 6);
      const resScale = (targetDims.width * targetDims.height) / (1920 * 1080);
      const scaledKbps = Math.max(300, Math.round(baseKbps * crfScale * Math.max(0.3, resScale)));
      targetBitrateBps = scaledKbps * 1000;
    }

    // Canvas for scaling and frame rendering
    const canvas = document.createElement('canvas');
    canvas.width = targetDims.width;
    canvas.height = targetDims.height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      URL.revokeObjectURL(video.src);
      return reject(new Error('Canvas 2D context not available'));
    }

    video.onloadedmetadata = () => {
      const stream = canvas.captureStream(30);

      // Extract Audio track if not stripped
      let audioCtx: AudioContext | null = null;
      let sourceNode: MediaElementAudioSourceNode | null = null;
      let destNode: MediaStreamAudioDestinationNode | null = null;

      if (!settings.stripAudio) {
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            audioCtx = new AudioContextClass();
            sourceNode = audioCtx.createMediaElementSource(video);
            destNode = audioCtx.createMediaStreamDestination();
            sourceNode.connect(destNode);

            // Connect destination audio track to canvas stream
            const audioTracks = destNode.stream.getAudioTracks();
            if (audioTracks.length > 0) {
              stream.addTrack(audioTracks[0]);
            }
          }
        } catch (e) {
          console.warn('Audio capture warning, continuing without separate audio context:', e);
        }
      }

      // Determine best supported container/codec
      const supportedMimeTypes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=h264',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];

      let chosenMime = '';
      for (const mime of supportedMimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          chosenMime = mime;
          break;
        }
      }

      const recorderOptions: MediaRecorderOptions = {
        videoBitsPerSecond: Math.max(150000, targetBitrateBps),
      };
      if (chosenMime) {
        recorderOptions.mimeType = chosenMime;
      }

      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, recorderOptions);
      } catch (err) {
        URL.revokeObjectURL(video.src);
        return reject(new Error('MediaRecorder initialization failed: ' + (err as Error).message));
      }

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      let animationFrameId: number;
      const renderFrame = () => {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, targetDims.width, targetDims.height);

        if (metadata.duration > 0 && onProgress) {
          const pct = Math.min(99, Math.round((video.currentTime / metadata.duration) * 100));
          onProgress(pct);
        }

        animationFrameId = requestAnimationFrame(renderFrame);
      };

      mediaRecorder.onstop = () => {
        cancelAnimationFrame(animationFrameId);
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close().catch(() => {});
        }
        URL.revokeObjectURL(video.src);

        const finalBlob = new Blob(chunks, { type: chosenMime || 'video/mp4' });
        const finalUrl = URL.createObjectURL(finalBlob);
        if (onProgress) onProgress(100);

        resolve({
          blob: finalBlob,
          url: finalUrl,
          size: finalBlob.size,
        });
      };

      mediaRecorder.onerror = (e) => {
        cancelAnimationFrame(animationFrameId);
        URL.revokeObjectURL(video.src);
        reject(new Error('MediaRecorder encoding error: ' + (e as unknown as ErrorEvent).message));
      };

      video.onended = () => {
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 200);
      };

      // Start compression playback
      video.play().then(() => {
        mediaRecorder.start(250); // Emit chunk every 250ms
        renderFrame();
      }).catch((playErr) => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Video playback start failed: ' + playErr.message));
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to decode source video file'));
    };
  });
}
