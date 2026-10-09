import { WatermarkPreset, WatermarkLayer, TextWatermarkLayer } from "./types";

export const DEFAULT_TEXT_LAYER: TextWatermarkLayer = {
  id: "default-text-1",
  name: "Watermark Text",
  type: "text",
  text: "© OmniTools Studio",
  fontFamily: "Inter, sans-serif",
  fontSize: 32,
  fontWeight: "bold",
  color: "#ffffff",
  opacity: 70,
  letterSpacing: 1,
  lineHeight: 1.2,
  textAlign: "center",
  rotation: 0,
  position: {
    anchor: "bottom-right",
    x: 0.85,
    y: 0.85,
    offsetXPercent: 0,
    offsetYPercent: 0,
    marginPercent: 5,
  },
  size: {
    mode: "relative-width",
    percentage: 22,
    fixedPx: 140,
    lockAspectRatio: true,
  },
  shadow: {
    enabled: true,
    color: "rgba(0,0,0,0.6)",
    blur: 6,
    offsetX: 2,
    offsetY: 2,
  },
  stroke: {
    enabled: false,
    color: "#000000",
    width: 2,
  },
  background: {
    enabled: false,
    color: "#000000",
    opacity: 50,
    padding: 8,
    borderRadius: 6,
  },
  visible: true,
  locked: false,
  tiled: false,
  tileSpacing: 120,
};

export const BUILT_IN_PRESETS: WatermarkPreset[] = [
  {
    id: "preset-social-media",
    name: "Social Media Branding",
    description: "Crisp bottom-right watermark ideal for Instagram, TikTok, and X posts.",
    layers: [
      {
        ...DEFAULT_TEXT_LAYER,
        id: "layer-sm-1",
        position: {
          anchor: "bottom-right",
          x: 0.85,
          y: 0.85,
          offsetXPercent: 0,
          offsetYPercent: 0,
          marginPercent: 4,
        },
        size: {
          mode: "relative-width",
          percentage: 20,
          fixedPx: 120,
          lockAspectRatio: true,
        },
        opacity: 75,
      },
    ],
    videoTiming: {
      enabled: false,
      startTime: 0,
      endTime: 10,
      fadeIn: 0.5,
      fadeOut: 0.5,
    },
    exportOptions: {
      filenameSuffix: "_watermarked",
      imageQuality: 0.88,
    },
  },
  {
    id: "preset-product-photo",
    name: "Product Photography",
    description: "Subtle, non-intrusive bottom-center label with gentle drop shadow.",
    layers: [
      {
        ...DEFAULT_TEXT_LAYER,
        id: "layer-pp-1",
        text: "© Official Store",
        position: {
          anchor: "bottom-center",
          x: 0.5,
          y: 0.92,
          offsetXPercent: 0,
          offsetYPercent: 0,
          marginPercent: 3,
        },
        size: {
          mode: "relative-width",
          percentage: 16,
          fixedPx: 100,
          lockAspectRatio: true,
        },
        opacity: 55,
      },
    ],
    videoTiming: {
      enabled: false,
      startTime: 0,
      endTime: 10,
      fadeIn: 0,
      fadeOut: 0,
    },
    exportOptions: {
      filenameSuffix: "_protected",
      imageQuality: 0.92,
    },
  },
  {
    id: "preset-center-shield",
    name: "Center Copyright Shield",
    description: "Prominent diagonal sample protector to prevent unauthorized use.",
    layers: [
      {
        ...DEFAULT_TEXT_LAYER,
        id: "layer-cs-1",
        text: "SAMPLE / DO NOT COPY",
        rotation: -35,
        opacity: 35,
        position: {
          anchor: "center",
          x: 0.5,
          y: 0.5,
          offsetXPercent: 0,
          offsetYPercent: 0,
          marginPercent: 0,
        },
        size: {
          mode: "relative-width",
          percentage: 55,
          fixedPx: 300,
          lockAspectRatio: true,
        },
      },
    ],
    videoTiming: {
      enabled: false,
      startTime: 0,
      endTime: 10,
      fadeIn: 0,
      fadeOut: 0,
    },
    exportOptions: {
      filenameSuffix: "_proof",
      imageQuality: 0.85,
    },
  },
  {
    id: "preset-diagonal-repeating",
    name: "Diagonal Repeating Pattern",
    description: "Full-coverage tiled repeating watermark pattern across media.",
    layers: [
      {
        ...DEFAULT_TEXT_LAYER,
        id: "layer-dr-1",
        text: "PROTECTED MEDIA",
        tiled: true,
        tileSpacing: 140,
        rotation: -30,
        opacity: 22,
        position: {
          anchor: "center",
          x: 0.5,
          y: 0.5,
          offsetXPercent: 0,
          offsetYPercent: 0,
          marginPercent: 0,
        },
        size: {
          mode: "relative-width",
          percentage: 20,
          fixedPx: 120,
          lockAspectRatio: true,
        },
      },
    ],
    videoTiming: {
      enabled: false,
      startTime: 0,
      endTime: 10,
      fadeIn: 0,
      fadeOut: 0,
    },
    exportOptions: {
      filenameSuffix: "_tiled",
      imageQuality: 0.85,
    },
  },
  {
    id: "preset-youtube-video",
    name: "YouTube Corner Bug",
    description: "Small, unobtrusive bottom-right watermark for video streaming.",
    layers: [
      {
        ...DEFAULT_TEXT_LAYER,
        id: "layer-yt-1",
        text: "Subscribe",
        position: {
          anchor: "bottom-right",
          x: 0.9,
          y: 0.9,
          offsetXPercent: 0,
          offsetYPercent: 0,
          marginPercent: 4,
        },
        size: {
          mode: "relative-width",
          percentage: 12,
          fixedPx: 90,
          lockAspectRatio: true,
        },
        opacity: 80,
      },
    ],
    videoTiming: {
      enabled: true,
      startTime: 3,
      endTime: 300,
      fadeIn: 1.0,
      fadeOut: 1.0,
    },
    exportOptions: {
      filenameSuffix: "_yt",
      videoFormat: "video/mp4",
      videoQuality: "high",
    },
  },
];

const PRESETS_STORAGE_KEY = "omnitools_watermark_presets_v1";

export function loadUserPresets(): WatermarkPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUserPresets(presets: WatermarkPreset[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error("Failed to save presets to localStorage", err);
  }
}
