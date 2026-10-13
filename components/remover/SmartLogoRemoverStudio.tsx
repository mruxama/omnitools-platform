"use client";

import React, { useState, useRef, useEffect } from "react";
import { SharedMediaUploader } from "@/components/shared/SharedMediaUploader";
import { removeObjectsFromImage, ObjectRemoverOptions, MaskRect } from "@/lib/remover/imageInpainter";
import { removeLogoFromVideo, VideoLogoRemoverOptions } from "@/lib/remover/videoRemover";
import { downloadBlob, formatBytes } from "@/lib/shared/exportHelper";
import {
  Wand2,
  Brush,
  Square,
  RotateCcw,
  Download,
  Eye,
  Sliders,
  Sparkles,
  Film,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

export function SmartLogoRemoverStudio() {
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSource, setImageSource] = useState<HTMLImageElement | null>(null);
  const [cleanedImageBlob, setCleanedImageBlob] = useState<Blob | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [brushSize, setBrushSize] = useState(25);
  const [selectionTool, setSelectionTool] = useState<"brush" | "rect">("brush");
  const [imageOptions, setImageOptions] = useState<ObjectRemoverOptions>({
    mode: "smart-inpaint",
    inpaintRadius: 8,
    blurRadius: 15,
    pixelSize: 12,
  });

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 1280, height: 720 });
  const [videoNormalizedRects, setVideoNormalizedRects] = useState<{ x: number; y: number; width: number; height: number }[]>([]);
  const [videoTimeRange, setVideoTimeRange] = useState({ start: 0, end: 10 });
  const [videoCleanedResult, setVideoCleanedResult] = useState<{ blob: Blob; outputName: string } | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOptions, setVideoOptions] = useState<VideoLogoRemoverOptions>({
    rects: [],
    startTime: 0,
    endTime: 10,
    mode: "blur",
    blurRadius: 16,
    outputFormat: "video/mp4",
  });

  // Canvas refs for image
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rects, setRects] = useState<MaskRect[]>([]);
  const rectStartRef = useRef<{ x: number; y: number } | null>(null);

  // Load image file into element
  useEffect(() => {
    if (!imageFile) return;
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    img.src = url;
    img.onload = () => {
      setImageSource(img);
      setCleanedImageBlob(null);
      setRects([]);
    };
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Video URL effect
  useEffect(() => {
    if (!videoFile) {
      setVideoUrl("");
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    setVideoCleanedResult(null);
    setVideoNormalizedRects([]);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  // Render image onto display canvas
  useEffect(() => {
    if (!imageSource || !imageCanvasRef.current || !maskCanvasRef.current) return;
    const canvas = imageCanvasRef.current;
    const mask = maskCanvasRef.current;

    canvas.width = imageSource.naturalWidth;
    canvas.height = imageSource.naturalHeight;
    mask.width = imageSource.naturalWidth;
    mask.height = imageSource.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(imageSource, 0, 0);

    const mCtx = mask.getContext("2d");
    if (mCtx) mCtx.clearRect(0, 0, mask.width, mask.height);
  }, [imageSource]);

  // Handle Drawing on image canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!maskCanvasRef.current) return;
    const mask = maskCanvasRef.current;
    const rect = mask.getBoundingClientRect();
    const scaleX = mask.width / rect.width;
    const scaleY = mask.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);

    if (selectionTool === "brush") {
      const ctx = mask.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.6)"; // Red mask overlay
        ctx.beginPath();
        ctx.arc(x, y, brushSize * (scaleX / 2), 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      rectStartRef.current = { x, y };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !maskCanvasRef.current) return;
    const mask = maskCanvasRef.current;
    const rect = mask.getBoundingClientRect();
    const scaleX = mask.width / rect.width;
    const scaleY = mask.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectionTool === "brush") {
      const ctx = mask.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.6)";
        ctx.beginPath();
        ctx.arc(x, y, brushSize * (scaleX / 2), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (selectionTool === "rect" && rectStartRef.current && maskCanvasRef.current) {
      const mask = maskCanvasRef.current;
      const rect = mask.getBoundingClientRect();
      const scaleX = mask.width / rect.width;
      const scaleY = mask.height / rect.height;
      const endX = (e.clientX - rect.left) * scaleX;
      const endY = (e.clientY - rect.top) * scaleY;

      const x = Math.min(rectStartRef.current.x, endX);
      const y = Math.min(rectStartRef.current.y, endY);
      const w = Math.abs(endX - rectStartRef.current.x);
      const h = Math.abs(endY - rectStartRef.current.y);

      if (w > 2 && h > 2) {
        const ctx = mask.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "rgba(239, 68, 68, 0.6)";
          ctx.fillRect(x, y, w, h);
        }
        setRects((prev) => [...prev, { x, y, width: w, height: h }]);
      }
      rectStartRef.current = null;
    }
  };

  const handleClearMask = () => {
    if (!maskCanvasRef.current || !imageSource || !imageCanvasRef.current) return;
    const mask = maskCanvasRef.current;
    const mCtx = mask.getContext("2d");
    if (mCtx) mCtx.clearRect(0, 0, mask.width, mask.height);

    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(imageSource, 0, 0);

    setRects([]);
    setCleanedImageBlob(null);
  };

  const handleProcessImage = async () => {
    if (!imageSource || !maskCanvasRef.current) return;
    setIsProcessingImage(true);

    try {
      const blob = await removeObjectsFromImage(
        imageSource,
        maskCanvasRef.current,
        rects,
        imageOptions
      );
      setCleanedImageBlob(blob);

      // Draw cleaned result on display canvas
      const bmp = await createImageBitmap(blob);
      const canvas = imageCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(bmp, 0, 0);
      }
      bmp.close();

      // Clear the red mask overlay
      const mask = maskCanvasRef.current;
      const mCtx = mask?.getContext("2d");
      if (mCtx) mCtx.clearRect(0, 0, mask.width, mask.height);
    } catch (err: any) {
      alert("Inpainting error: " + err.message);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Video Process
  const handleProcessVideo = async () => {
    if (!videoFile || videoNormalizedRects.length === 0) {
      alert("Please pause the video and drag or click a box over the logo to conceal first.");
      return;
    }
    setIsProcessingVideo(true);
    setVideoProgress(0);

    // Convert normalized coordinates (0..1) to actual video pixel dimensions
    const scaledRects: MaskRect[] = videoNormalizedRects.map((nr) => ({
      x: Math.round(nr.x * videoDimensions.width),
      y: Math.round(nr.y * videoDimensions.height),
      width: Math.round(nr.width * videoDimensions.width),
      height: Math.round(nr.height * videoDimensions.height),
    }));

    try {
      const res = await removeLogoFromVideo(
        videoFile,
        {
          ...videoOptions,
          rects: scaledRects,
          startTime: videoTimeRange.start,
          endTime: videoTimeRange.end,
        },
        (pct) => setVideoProgress(pct)
      );
      setVideoCleanedResult(res);
    } catch (err: any) {
      alert("Video processing error: " + err.message);
    } finally {
      setIsProcessingVideo(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-sm">
          <Wand2 className="w-3.5 h-3.5" /> Smart Inpainting & Boundary Diffusion Engine
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Smart Logo & Object Remover
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground">
          Erase logos, timestamps, stickers, and unwanted elements from images and videos.
          Boundary-aware smart inpainting running 100% privately in your browser.
        </p>
      </div>

      {/* Tab Selector: Image vs Video */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-muted border border-border shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "image"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-primary" />
            <span>Image Remover</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "video"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Film className="w-4 h-4 text-primary" />
            <span>Video Logo Remover</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: IMAGE REMOVER ===================== */}
      {activeTab === "image" && (
        <div className="space-y-6">
          {!imageFile ? (
            <SharedMediaUploader
              accept="image/png,image/jpeg,image/webp,image/bmp"
              title="Drop an Image to Erase Unwanted Objects"
              description="JPG, PNG, WebP supported • Direct browser-side inpainting"
              onFilesSelected={(files) => files[0] && setImageFile(files[0])}
              multiple={false}
            />
          ) : (
            <div className="space-y-6">
              {/* Controls Toolbar */}
              <div className="p-4 sm:p-5 bg-card border border-border rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Tool selection */}
                  <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSelectionTool("brush")}
                      className={`p-2 rounded-lg font-semibold flex items-center gap-1.5 ${
                        selectionTool === "brush" ? "bg-card text-primary shadow-xs" : "text-muted-foreground"
                      }`}
                      title="Brush Paint Selection"
                    >
                      <Brush className="w-4 h-4" />
                      <span>Brush</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectionTool("rect")}
                      className={`p-2 rounded-lg font-semibold flex items-center gap-1.5 ${
                        selectionTool === "rect" ? "bg-card text-primary shadow-xs" : "text-muted-foreground"
                      }`}
                      title="Rectangle Box Selection"
                    >
                      <Square className="w-4 h-4" />
                      <span>Rectangle</span>
                    </button>
                  </div>

                  {selectionTool === "brush" && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-xl">
                      <span className="text-[11px] text-muted-foreground">Brush: {brushSize}px</span>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-20 accent-primary cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Mode selector */}
                  <select
                    value={imageOptions.mode}
                    onChange={(e) =>
                      setImageOptions((prev) => ({
                        ...prev,
                        mode: e.target.value as any,
                      }))
                    }
                    className="p-2 rounded-xl border border-border bg-background text-foreground font-medium outline-none"
                  >
                    <option value="smart-inpaint">Smart Inpaint (Natural Background)</option>
                    <option value="blur">Blur Concealment</option>
                    <option value="pixelate">Pixelate Box</option>
                    <option value="solid-fill">Solid Fill</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearMask}
                    className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessingImage}
                    onClick={handleProcessImage}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isProcessingImage ? "Eradicating..." : "Erase Selected Region"}</span>
                  </button>

                  {cleanedImageBlob && (
                    <button
                      type="button"
                      onClick={() => downloadBlob(cleanedImageBlob, `cleaned_${imageFile.name}`)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Cleaned Image</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Drawing Viewport */}
              <div className="relative border border-border bg-muted/20 rounded-3xl overflow-hidden flex items-center justify-center p-4 min-h-[400px]">
                <div className="relative inline-block max-w-full max-h-[70vh] shadow-lg rounded-xl overflow-hidden">
                  <canvas
                    ref={imageCanvasRef}
                    className="max-w-full max-h-[70vh] object-contain block"
                  />
                  <canvas
                    ref={maskCanvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: VIDEO LOGO REMOVER ===================== */}
      {activeTab === "video" && (
        <div className="space-y-6">
          {!videoFile ? (
            <SharedMediaUploader
              accept="video/mp4,video/webm,video/quicktime,video/*"
              title="Drop a Video to Conceal or Blur Watermarks"
              description="MP4 or WebM supported • Pause video & drag a box over logo"
              onFilesSelected={(files) => files[0] && setVideoFile(files[0])}
              multiple={false}
            />
          ) : (
            <div className="space-y-6">
              {/* Video Workspace */}
              <div className="p-5 bg-card border border-border rounded-3xl shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Video Logo Concealment</h3>
                    <p className="text-xs text-muted-foreground">
                      Pause video at the watermark position and click on the preview to place the blur mask.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={videoOptions.mode}
                      onChange={(e) =>
                        setVideoOptions((prev) => ({
                          ...prev,
                          mode: e.target.value as any,
                        }))
                      }
                      className="p-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium"
                    >
                      <option value="blur">Gaussian Blur Mask</option>
                      <option value="pixelate">Pixelated Censor</option>
                      <option value="solid-fill">Solid Black Fill</option>
                    </select>

                    <button
                      type="button"
                      disabled={isProcessingVideo}
                      onClick={handleProcessVideo}
                      className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 shadow-sm flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isProcessingVideo ? `Rendering (${videoProgress}%)` : "Export Cleaned Video"}</span>
                    </button>
                  </div>
                </div>

                {/* Video Player with Interactive Mask Box */}
                <div className="relative max-w-2xl mx-auto aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    playsInline
                    onLoadedMetadata={(e) => {
                      const v = e.target as HTMLVideoElement;
                      const dur = v.duration || 10;
                      setVideoDuration(dur);
                      setVideoTimeRange({ start: 0, end: dur });
                      setVideoDimensions({
                        width: v.videoWidth || 1280,
                        height: v.videoHeight || 720,
                      });
                    }}
                    className="w-full h-full object-contain"
                  />
                  {/* Click to add watermark box */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const clickY = e.clientY - rect.top;
                      const boxW = 100;
                      const boxH = 40;
                      const normX = Math.max(0, Math.min(1 - boxW / rect.width, (clickX - boxW / 2) / rect.width));
                      const normY = Math.max(0, Math.min(1 - boxH / rect.height, (clickY - boxH / 2) / rect.height));
                      const normW = Math.min(1 - normX, boxW / rect.width);
                      const normH = Math.min(1 - normY, boxH / rect.height);
                      setVideoNormalizedRects([
                        {
                          x: normX,
                          y: normY,
                          width: normW,
                          height: normH,
                        },
                      ]);
                    }}
                    className="absolute inset-0 cursor-crosshair"
                  >
                    {videoNormalizedRects.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          left: `${r.x * 100}%`,
                          top: `${r.y * 100}%`,
                          width: `${r.width * 100}%`,
                          height: `${r.height * 100}%`,
                        }}
                        className="absolute border-2 border-red-500 bg-red-500/30 flex items-center justify-center text-[10px] text-white font-bold rounded shadow-md pointer-events-none"
                      >
                        Logo Mask
                      </div>
                    ))}
                  </div>
                </div>

                {videoCleanedResult && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Video Successfully Exported ({formatBytes(videoCleanedResult.blob.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadBlob(videoCleanedResult.blob, videoCleanedResult.outputName)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Cleaned Video
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
