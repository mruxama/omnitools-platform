import { VideoMetadata, CompressionSettings } from './types';

export const CONTAINER_OVERHEAD_ESTIMATE_PERCENT = 0.02; // ~2% overhead for MP4/WebM muxing

/**
 * Calculates optimal video bitrate (in kbps) required to hit a target file size in MB.
 * Formula: Total Bitrate = (Target File Size in bits / Duration in seconds)
 * Video Bitrate = Total Bitrate - Audio Bitrate
 */
export function calculateBitrateForTargetSize(
  targetSizeMB: number,
  durationSec: number,
  audioBitrateKbps: number = 128,
  stripAudio: boolean = false
): { videoBitrateKbps: number; totalBitrateKbps: number } {
  if (durationSec <= 0) {
    return { videoBitrateKbps: 1000, totalBitrateKbps: 1128 };
  }

  // Convert target MB to total bits minus container overhead
  const targetBytes = targetSizeMB * 1024 * 1024;
  const usableBytes = targetBytes * (1 - CONTAINER_OVERHEAD_ESTIMATE_PERCENT);
  const totalBits = usableBytes * 8;
  const totalBitrateKbps = Math.floor(totalBits / durationSec / 1000);

  const effectiveAudioKbps = stripAudio ? 0 : audioBitrateKbps;
  // Floor video bitrate to safe minimum of 100 kbps to prevent unplayable output
  const videoBitrateKbps = Math.max(100, totalBitrateKbps - effectiveAudioKbps);

  return {
    videoBitrateKbps,
    totalBitrateKbps,
  };
}

/**
 * Calculates estimated target size (in bytes and MB) based on compression settings and metadata
 */
export function estimateOutputSize(
  metadata: VideoMetadata,
  settings: CompressionSettings
): { estimatedBytes: number; estimatedMB: number; estimatedSavingsPercent: number } {
  const originalBytes = metadata.fileSize;
  const duration = metadata.duration || 10;

  let estimatedBytes: number;

  switch (settings.mode) {
    case 'target-size': {
      if (settings.targetSizeMB) {
        estimatedBytes = settings.targetSizeMB * 1024 * 1024;
      } else if (settings.percentageReduction !== undefined) {
        estimatedBytes = originalBytes * (1 - settings.percentageReduction / 100);
      } else {
        estimatedBytes = originalBytes * 0.5;
      }
      break;
    }

    case 'bitrate': {
      const vBitrate = settings.videoBitrateKbps || 1200;
      const aBitrate = settings.stripAudio ? 0 : (settings.audioBitrateKbps || 128);
      const totalBitrateKbps = vBitrate + aBitrate;
      const bits = totalBitrateKbps * 1000 * duration;
      estimatedBytes = Math.floor((bits / 8) * (1 + CONTAINER_OVERHEAD_ESTIMATE_PERCENT));
      break;
    }

    case 'quality': {
      // CRF curve estimation: CRF 23 is baseline 1.0x factor
      // Every 6 CRF units roughly halves or doubles bitrate
      // CRF 18 = high quality (~1.7x), CRF 28 = medium/small (~0.5x), CRF 32 = small (~0.35x)
      const baseCrf = 23;
      const crfFactor = Math.pow(2, (baseCrf - settings.crf) / 6);
      
      // Also scale by resolution reduction if active
      let resFactor = 1.0;
      if (settings.targetResolution && settings.targetResolution !== 'original') {
        const resolutionFactors: Record<string, number> = {
          '4k': 2.0,
          '1440p': 1.4,
          '1080p': 1.0,
          '720p': 0.55,
          '480p': 0.35,
          '360p': 0.20,
        };
        const originalEstimatedTier = metadata.height >= 2160 ? 2.0 : metadata.height >= 1080 ? 1.0 : 0.55;
        const targetTier = resolutionFactors[settings.targetResolution] || 1.0;
        resFactor = Math.min(1.0, targetTier / originalEstimatedTier);
      }

      estimatedBytes = originalBytes * Math.min(0.95, Math.max(0.08, 0.65 * crfFactor * resFactor));
      break;
    }

    case 'resolution': {
      let resRatio = 1.0;
      if (settings.targetResolution && settings.targetResolution !== 'original') {
        const heightMap: Record<string, number> = {
          '4k': 2160,
          '1440p': 1440,
          '1080p': 1080,
          '720p': 720,
          '480p': 480,
          '360p': 360,
        };
        const targetH = heightMap[settings.targetResolution] || metadata.height;
        if (metadata.height > 0) {
          resRatio = Math.min(1.0, Math.pow(targetH / metadata.height, 1.5));
        }
      }
      estimatedBytes = originalBytes * Math.max(0.1, resRatio * 0.7);
      break;
    }

    default:
      estimatedBytes = originalBytes * 0.5;
  }

  // Ensure estimation does not exceed original size or fall below 50KB
  estimatedBytes = Math.min(originalBytes * 0.98, Math.max(50 * 1024, estimatedBytes));
  const estimatedMB = +(estimatedBytes / (1024 * 1024)).toFixed(2);
  const estimatedSavingsPercent = Math.max(0, Math.round(((originalBytes - estimatedBytes) / originalBytes) * 100));

  return {
    estimatedBytes: Math.round(estimatedBytes),
    estimatedMB,
    estimatedSavingsPercent,
  };
}

/**
 * Calculates target width and height according to aspect ratio and selected resolution profile.
 */
export function calculateTargetDimensions(
  origWidth: number,
  origHeight: number,
  targetResolution?: 'original' | '4k' | '1440p' | '1080p' | '720p' | '480p' | '360p' | 'custom',
  customWidth?: number,
  customHeight?: number
): { width: number; height: number } {
  if (!origWidth || !origHeight) {
    return { width: 1280, height: 720 };
  }

  if (targetResolution === 'custom' && customWidth && customHeight) {
    // FFmpeg requires even dimensions (divisible by 2) for H.264 / most encoders
    return {
      width: makeEven(customWidth),
      height: makeEven(customHeight),
    };
  }

  if (!targetResolution || targetResolution === 'original') {
    return {
      width: makeEven(origWidth),
      height: makeEven(origHeight),
    };
  }

  const standardHeights: Record<string, number> = {
    '4k': 2160,
    '1440p': 1440,
    '1080p': 1080,
    '720p': 720,
    '480p': 480,
    '360p': 360,
  };

  const targetMaxHeight = standardHeights[targetResolution];
  if (!targetMaxHeight || origHeight <= targetMaxHeight) {
    // Do not upscale videos
    return {
      width: makeEven(origWidth),
      height: makeEven(origHeight),
    };
  }

  const aspectRatio = origWidth / origHeight;
  const newHeight = makeEven(targetMaxHeight);
  const newWidth = makeEven(Math.round(newHeight * aspectRatio));

  return { width: newWidth, height: newHeight };
}

export function makeEven(val: number): number {
  const round = Math.round(val);
  return round % 2 === 0 ? round : round - 1;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
