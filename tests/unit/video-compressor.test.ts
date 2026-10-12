import { describe, it, expect } from 'vitest';
import {
  calculateBitrateForTargetSize,
  estimateOutputSize,
  calculateTargetDimensions,
  makeEven,
} from '@/lib/video-compressor/bitrateCalculator';
import { DEFAULT_COMPRESSION_SETTINGS } from '@/lib/video-compressor/presets';
import { buildFFmpegArgs } from '@/lib/video-compressor/ffmpegArgs';

describe('Bitrate & Compression Calculator', () => {
  it('calculates bitrate correctly for a target size in MB', () => {
    // 10 MB file, 60 seconds duration, 128 kbps audio
    const res = calculateBitrateForTargetSize(10, 60, 128, false);
    expect(res.videoBitrateKbps).toBeGreaterThan(100);
    expect(res.totalBitrateKbps).toBeGreaterThan(res.videoBitrateKbps);

    // Target MB to total bits: 10 * 1024 * 1024 * 0.98 * 8 / 60 / 1000 ~= 1369 kbps total
    expect(res.totalBitrateKbps).toBeCloseTo(1370, -2);
    expect(res.videoBitrateKbps).toBeCloseTo(1370 - 128, -2);
  });

  it('handles stripped audio bitrate calculation', () => {
    const res = calculateBitrateForTargetSize(5, 30, 128, true);
    // When audio is stripped, full budget is available for video
    expect(res.videoBitrateKbps).toBe(res.totalBitrateKbps);
  });

  it('calculates even dimensions to prevent codec encoding errors', () => {
    expect(makeEven(1920)).toBe(1920);
    expect(makeEven(1921)).toBe(1920);
    expect(makeEven(1081)).toBe(1080);

    const dims = calculateTargetDimensions(1920, 1080, '720p');
    expect(dims.height).toBe(720);
    expect(dims.width).toBe(1280);
    expect(dims.width % 2).toBe(0);
    expect(dims.height % 2).toBe(0);
  });

  it('does not upscale videos', () => {
    const dims = calculateTargetDimensions(640, 360, '1080p');
    expect(dims.width).toBe(640);
    expect(dims.height).toBe(360);
  });

  it('estimates output size correctly across modes', () => {
    const metadata = {
      filename: 'sample.mp4',
      fileSize: 50 * 1024 * 1024, // 50MB
      duration: 60,
      width: 1920,
      height: 1080,
      aspectRatio: 16 / 9,
      fps: 30,
    };

    const targetSizeSettings = {
      ...DEFAULT_COMPRESSION_SETTINGS,
      mode: 'target-size' as const,
      targetSizeMB: 15,
    };
    const estTarget = estimateOutputSize(metadata, targetSizeSettings);
    expect(estTarget.estimatedMB).toBe(15);
    expect(estTarget.estimatedSavingsPercent).toBe(70);

    const qualitySettings = {
      ...DEFAULT_COMPRESSION_SETTINGS,
      mode: 'quality' as const,
      crf: 28,
    };
    const estQuality = estimateOutputSize(metadata, qualitySettings);
    expect(estQuality.estimatedBytes).toBeLessThan(metadata.fileSize);
    expect(estQuality.estimatedSavingsPercent).toBeGreaterThan(0);
  });

  it('builds valid FFmpeg command arguments', () => {
    const result = buildFFmpegArgs('input.mp4', 'output.mp4', {
      ...DEFAULT_COMPRESSION_SETTINGS,
      mode: 'quality',
      crf: 23,
      targetResolution: '720p',
    }, {
      filename: 'input.mp4',
      fileSize: 20 * 1024 * 1024,
      duration: 30,
      width: 1920,
      height: 1080,
      aspectRatio: 16 / 9,
      fps: 30,
    });

    expect(result.args).toContain('-i');
    expect(result.args).toContain('input.mp4');
    expect(result.args).toContain('-c:v');
    expect(result.args).toContain('libx264');
    expect(result.args).toContain('-crf');
    expect(result.args).toContain('23');
    expect(result.args).toContain('-movflags');
    expect(result.args).toContain('+faststart');
    expect(result.args).toContain('output.mp4');
  });
});
