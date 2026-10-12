import { CompressionSettings, VideoMetadata } from './types';
import { calculateBitrateForTargetSize, calculateTargetDimensions } from './bitrateCalculator';

export interface FFmpegCommandResult {
  args: string[];
  pass1Args?: string[];
  pass2Args?: string[];
  outputFilename: string;
}

/**
 * Builds safe, production-grade FFmpeg command line arguments based on user settings and video metadata.
 */
export function buildFFmpegArgs(
  inputFilename: string,
  outputFilename: string,
  settings: CompressionSettings,
  metadata?: VideoMetadata
): FFmpegCommandResult {
  const args: string[] = ['-y', '-i', inputFilename];

  // Video codec
  const videoEncoder = getVideoEncoder(settings.videoCodec);
  args.push('-c:v', videoEncoder);

  // Resolution scaling filter
  const targetDims = calculateTargetDimensions(
    metadata?.width || 1920,
    metadata?.height || 1080,
    settings.targetResolution,
    settings.customWidth,
    settings.customHeight
  );

  const filters: string[] = [];
  if (
    metadata &&
    (targetDims.width !== metadata.width || targetDims.height !== metadata.height)
  ) {
    // scale filter with even dimension enforcement
    filters.push(`scale=${targetDims.width}:${targetDims.height}:flags=bicubic`);
  }

  // Format pixel to yuv420p for standard universal device playback
  if (settings.videoCodec === 'h264' || settings.videoCodec === 'h265') {
    filters.push('format=yuv420p');
  }

  if (filters.length > 0) {
    args.push('-vf', filters.join(','));
  }

  // Preset speed
  if (settings.videoCodec === 'h264' || settings.videoCodec === 'h265') {
    args.push('-preset', settings.presetSpeed || 'medium');
  }

  // Rate Control / Compression Mode
  if (settings.mode === 'target-size') {
    const duration = metadata?.duration || 10;
    const targetMB = settings.targetSizeMB || 15;
    const { videoBitrateKbps } = calculateBitrateForTargetSize(
      targetMB,
      duration,
      settings.audioBitrateKbps,
      settings.stripAudio
    );
    args.push('-b:v', `${videoBitrateKbps}k`);
    args.push('-maxrate', `${Math.round(videoBitrateKbps * 1.4)}k`);
    args.push('-bufsize', `${Math.round(videoBitrateKbps * 2.0)}k`);
  } else if (settings.mode === 'bitrate') {
    const vBitrate = settings.videoBitrateKbps || 1200;
    args.push('-b:v', `${vBitrate}k`);
    args.push('-maxrate', `${Math.round(vBitrate * 1.3)}k`);
    args.push('-bufsize', `${Math.round(vBitrate * 2.0)}k`);
  } else {
    // CRF Quality Mode
    if (settings.videoCodec === 'h264' || settings.videoCodec === 'h265') {
      args.push('-crf', String(settings.crf));
    } else if (settings.videoCodec === 'vp9') {
      args.push('-crf', String(settings.crf), '-b:v', '0');
    }
  }

  // Audio settings
  if (settings.stripAudio) {
    args.push('-an');
  } else {
    const audioEncoder = getAudioEncoder(settings.audioCodec);
    args.push('-c:a', audioEncoder);
    if (audioEncoder !== 'copy') {
      args.push('-b:a', `${settings.audioBitrateKbps || 128}k`);
    }
  }

  // Web streaming optimization (moov atom at beginning)
  if (settings.fastStart && (settings.container === 'mp4' || settings.container === 'mov')) {
    args.push('-movflags', '+faststart');
  }

  args.push(outputFilename);

  return {
    args,
    outputFilename,
  };
}

function getVideoEncoder(codec: string): string {
  switch (codec) {
    case 'h265':
      return 'libx265';
    case 'vp9':
      return 'libvpx-vp9';
    case 'av1':
      return 'libsvtav1';
    case 'copy':
      return 'copy';
    case 'h264':
    default:
      return 'libx264';
  }
}

function getAudioEncoder(codec: string): string {
  switch (codec) {
    case 'mp3':
      return 'libmp3lame';
    case 'opus':
      return 'libopus';
    case 'copy':
      return 'copy';
    case 'none':
      return 'an';
    case 'aac':
    default:
      return 'aac';
  }
}
