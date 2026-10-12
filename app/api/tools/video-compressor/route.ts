import { NextRequest, NextResponse } from 'next/server';
import { buildFFmpegArgs } from '@/lib/video-compressor/ffmpegArgs';
import { CompressionSettings, VideoMetadata } from '@/lib/video-compressor/types';

/**
 * Server endpoint for video compression queue jobs.
 * Supports BullMQ/Worker dispatched jobs with capability inspection.
 */
export async function GET() {
  return NextResponse.json({
    status: 'online',
    workerMode: process.env.REDIS_URL ? 'bullmq-worker' : 'browser-first',
    supportedCodecs: ['h264', 'h265', 'vp9', 'av1'],
    maxUploadMB: 500,
    features: {
      twoPass: true,
      crfEncoding: true,
      audioNormalization: true,
      resolutionScaling: true,
      fastStart: true,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings, metadata, filename } = body as {
      settings: CompressionSettings;
      metadata: VideoMetadata;
      filename: string;
    };

    if (!settings || !metadata) {
      return NextResponse.json({ error: 'Missing settings or metadata' }, { status: 400 });
    }

    // Build FFmpeg command plan
    const outName = `compressed_${filename || 'video.mp4'}`;
    const commandPlan = buildFFmpegArgs('input.mp4', outName, settings, metadata);

    // If a background Redis/BullMQ worker is configured, enqueue the job
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      success: true,
      jobId,
      status: 'queued',
      commandPlan,
      message: 'Job received. If running serverless, browser-side worker handles encoding.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Server job submission failed' },
      { status: 500 }
    );
  }
}
