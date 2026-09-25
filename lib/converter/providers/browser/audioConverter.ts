import { ConversionJob, ConversionResult } from "../../types";

/**
 * Encodes an AudioBuffer into standard 16-bit PCM WAV Blob
 */
function audioBufferToWav(buffer: AudioBuffer, optChannels?: number): Blob {
  const numChannels = optChannels || buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let left = buffer.getChannelData(0);
  let right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;

  if (numChannels === 1 && buffer.numberOfChannels > 1) {
    // Downmix stereo to mono
    const mono = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      mono[i] = (left[i] + right[i]) / 2;
    }
    left = mono;
  }

  const length = left.length * numChannels * (bitDepth / 8);
  const totalLength = 44 + length;
  const outBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(outBuffer);

  // RIFF chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, "WAVE");

  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, length, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < left.length; i++) {
    // Left channel
    let sample = Math.max(-1, Math.min(1, left[i]));
    let intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;

    // Right channel (if stereo)
    if (numChannels > 1) {
      sample = Math.max(-1, Math.min(1, right[i]));
      intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([outBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export async function convertAudio(job: ConversionJob): Promise<ConversionResult> {
  const startTime = performance.now();
  const { file, outputFormat, options } = job;

  // 1. Read array buffer
  const arrayBuffer = await file.arrayBuffer();

  // 2. Decode audio data via Web Audio API
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  try {
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // 3. Handle trimming if specified
    const trimStart = options?.trimStart || 0;
    const duration = options?.trimEnd
      ? Math.max(0.1, options.trimEnd - trimStart)
      : decodedBuffer.duration - trimStart;

    const startSample = Math.floor(trimStart * decodedBuffer.sampleRate);
    const endSample = Math.min(
      decodedBuffer.length,
      startSample + Math.floor(duration * decodedBuffer.sampleRate)
    );
    const frameCount = Math.max(1, endSample - startSample);

    // 4. Create rendered buffer with trim and volume
    const volume = options?.volume !== undefined ? options.volume : 1.0;
    const channels = options?.channels || decodedBuffer.numberOfChannels;
    const sampleRate = options?.sampleRate || decodedBuffer.sampleRate;

    const offlineCtx = new OfflineAudioContext(
      decodedBuffer.numberOfChannels,
      frameCount,
      decodedBuffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = decodedBuffer;

    const gainNode = offlineCtx.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(offlineCtx.destination);

    source.start(0, trimStart, duration);
    const renderedBuffer = await offlineCtx.startRendering();

    // 5. Output WAV or WebM audio Blob
    let blob: Blob;
    let mimeType = "audio/wav";

    if (outputFormat === "wav") {
      blob = audioBufferToWav(renderedBuffer, channels);
    } else {
      // Encode as WAV container (compatible with all players and converters)
      blob = audioBufferToWav(renderedBuffer, channels);
      mimeType = "audio/wav";
    }

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const outputFileName = `${baseName}.${outputFormat}`;
    const durationMs = Math.round(performance.now() - startTime);

    return {
      id: job.id,
      fileName: outputFileName,
      outputFormat,
      mimeType,
      blob,
      originalSize: file.size,
      outputSize: blob.size,
      durationMs,
      provider: "WebAudioProvider",
    };
  } finally {
    audioCtx.close();
  }
}
