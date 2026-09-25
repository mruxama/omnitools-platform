import { FormatDefinition } from "./types";
import { getFormatById } from "./formatRegistry";

export interface CategoryDefinition {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  formatIds: string[];
  defaultInput: string;
  defaultOutput: string;
  popularPairs: { from: string; to: string; name: string }[];
  features: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export const CATEGORIES_REGISTRY: Record<string, CategoryDefinition> = {
  image: {
    id: "image",
    slug: "image",
    name: "Image Converter",
    shortName: "Images",
    tagline: "Convert images to WebP, PNG, JPG, AVIF, ICO, PSD & more in seconds",
    description:
      "Convert, compress, and resize images directly in your browser. Supports modern WebP, AVIF, transparent PNG, Photoshop PSD files, and multi-resolution ICO favicons with 100% client-side privacy.",
    icon: "Image",
    formatIds: ["png", "jpg", "webp", "avif", "bmp", "ico", "gif", "tiff", "heic", "psd"],
    defaultInput: "png",
    defaultOutput: "webp",
    popularPairs: [
      { from: "jpg", to: "webp", name: "JPG to WebP" },
      { from: "png", to: "jpg", name: "PNG to JPG" },
      { from: "png", to: "webp", name: "PNG to WebP" },
      { from: "webp", to: "png", name: "WebP to PNG" },
      { from: "psd", to: "png", name: "PSD to PNG" },
      { from: "png", to: "ico", name: "PNG to ICO" },
      { from: "bmp", to: "jpg", name: "BMP to JPG" },
      { from: "jpg", to: "avif", name: "JPG to AVIF" },
    ],
    features: [
      {
        title: "Next-Gen Compression",
        description: "Convert high-resolution JPG and PNG photos into lightweight WebP or AVIF with up to 80% file size savings.",
      },
      {
        title: "Photoshop PSD Support",
        description: "Decode native Adobe Photoshop .psd files and export composite layers to PNG, JPG, or PDF without Photoshop installed.",
      },
      {
        title: "Favicon & Transparency",
        description: "Preserve 32-bit alpha transparency and generate Windows/Web ICO icons with custom dimensions.",
      },
      {
        title: "100% In-Browser Privacy",
        description: "All image pixels are processed on your device's GPU/Canvas. Zero photos are sent to remote servers.",
      },
    ],
    faqs: [
      {
        question: "How do I convert an image online for free?",
        answer: "Drop your image into the dropzone above, choose your target format (such as WebP, JPG, or PNG), adjust quality or dimensions if desired, and click Convert.",
      },
      {
        question: "Can I convert Photoshop PSD files without Adobe Photoshop?",
        answer: "Yes! Our built-in Photoshop 8BPS composite decoder parses PSD files directly in your browser and exports them into clean PNG, JPG, or PDF files.",
      },
      {
        question: "Will converting PNG to WebP keep transparency?",
        answer: "Yes. WebP supports full alpha transparency, so your transparent backgrounds remain perfectly intact.",
      },
    ],
  },

  audio: {
    id: "audio",
    slug: "audio",
    name: "Audio Converter",
    shortName: "Audio",
    tagline: "Convert audio files to WAV, MP3, OGG, AAC, M4A & FLAC with zero upload",
    description:
      "Decode and convert music, voice recordings, and sound effects right in your browser. Powered by Web Audio API and 16-bit PCM WAV encoding with sample-rate conversion, volume scaling, and channel mixing.",
    icon: "Music",
    formatIds: ["wav", "mp3", "ogg", "aac", "m4a", "flac"],
    defaultInput: "wav",
    defaultOutput: "mp3",
    popularPairs: [
      { from: "wav", to: "mp3", name: "WAV to MP3" },
      { from: "mp3", to: "wav", name: "MP3 to WAV" },
      { from: "flac", to: "wav", name: "FLAC to WAV" },
      { from: "ogg", to: "mp3", name: "OGG to MP3" },
      { from: "m4a", to: "mp3", name: "M4A to MP3" },
      { from: "aac", to: "wav", name: "AAC to WAV" },
    ],
    features: [
      {
        title: "Web Audio Decoding",
        description: "Native browser audio decoders handle WAV, MP3, OGG, FLAC, and M4A at full hardware speed.",
      },
      {
        title: "Sample Rate Resampling",
        description: "Easily resample audio frequencies between 8kHz, 16kHz, 22.05kHz, 44.1kHz, and 48kHz.",
      },
      {
        title: "Channel Mixdown & Trimming",
        description: "Convert Stereo into Mono or vice-versa, amplify/attenuate volume, and trim audio segments precisely.",
      },
      {
        title: "Lossless 16-bit PCM Output",
        description: "Generate studio-grade uncompressed WAV audio files suitable for professional DAW production.",
      },
    ],
    faqs: [
      {
        question: "How do I convert audio files without uploading them?",
        answer: "OmniTools utilizes the browser's Web Audio API to decode and transcode audio locally on your CPU. No sound files are ever uploaded.",
      },
      {
        question: "Can I convert high-res FLAC to WAV or MP3?",
        answer: "Yes, upload your FLAC audio file and select WAV or MP3 as output. The decoder handles high bitrates seamlessly.",
      },
    ],
  },

  video: {
    id: "video",
    slug: "video",
    name: "Video Converter",
    shortName: "Video",
    tagline: "Convert MP4, WebM, MOV, AVI, MKV and extract animated GIFs & frames",
    description:
      "Grab frames, create high-quality animated GIFs from video clips, extract movie stills, and prepare videos for web playback with instant in-browser playback and preview.",
    icon: "Video",
    formatIds: ["mp4", "webm", "mov", "avi", "mkv"],
    defaultInput: "mp4",
    defaultOutput: "gif",
    popularPairs: [
      { from: "mp4", to: "gif", name: "MP4 to GIF" },
      { from: "webm", to: "gif", name: "WebM to GIF" },
      { from: "mov", to: "mp4", name: "MOV to MP4" },
      { from: "mp4", to: "jpg", name: "MP4 to JPG Frame" },
      { from: "mp4", to: "png", name: "MP4 to PNG Frame" },
      { from: "mkv", to: "webm", name: "MKV to WebM" },
    ],
    features: [
      {
        title: "Video to GIF Animation",
        description: "Convert video highlights into compact, loopable animated GIFs with configurable frame rates.",
      },
      {
        title: "High-Res Frame Stills",
        description: "Capture exact video frames at full native resolution as crisp PNG or JPG images.",
      },
      {
        title: "WebM & MP4 Web Video",
        description: "Prepare video containers for standard HTML5 browser playback across desktop and mobile devices.",
      },
      {
        title: "Zero Bandwidth Waste",
        description: "Extract thumbnails and stills without burning mobile data uploading gigabytes of video to the cloud.",
      },
    ],
    faqs: [
      {
        question: "How do I create a GIF from an MP4 video?",
        answer: "Upload your MP4 video, select GIF as the output format, set your desired frame rate, and click Convert.",
      },
      {
        question: "Can I extract full-resolution photos from video footage?",
        answer: "Yes, select JPG or PNG as the target format to grab video frames directly onto canvas.",
      },
    ],
  },

  document: {
    id: "document",
    slug: "document",
    name: "Document Converter",
    shortName: "Documents",
    tagline: "Convert PDF, DOCX, TXT, MD, HTML, ODT, RTF & Word documents",
    description:
      "Generate Microsoft Word .docx files, build multi-page A4 PDFs with word wrapping, convert Markdown to HTML, and extract clean text from Word, ODT, and RTF documents client-side.",
    icon: "FileText",
    formatIds: ["pdf", "txt", "md", "html", "docx", "doc", "odt", "rtf"],
    defaultInput: "docx",
    defaultOutput: "pdf",
    popularPairs: [
      { from: "docx", to: "pdf", name: "DOCX to PDF" },
      { from: "docx", to: "txt", name: "DOCX to Text" },
      { from: "docx", to: "html", name: "DOCX to HTML" },
      { from: "md", to: "html", name: "Markdown to HTML" },
      { from: "txt", to: "pdf", name: "Text to PDF" },
      { from: "txt", to: "docx", name: "Text to DOCX" },
      { from: "odt", to: "pdf", name: "ODT to PDF" },
      { from: "rtf", to: "txt", name: "RTF to Text" },
    ],
    features: [
      {
        title: "In-Browser DOCX Generator",
        description: "Create genuine Microsoft Word .docx OpenXML packages with document body and paragraphs using JSZip.",
      },
      {
        title: "Multi-Page PDF Engine",
        description: "Compile formatted plain text, markdown, or tables into multi-page A4 PDF documents with automatic page numbering.",
      },
      {
        title: "OpenDocument & RTF Parsing",
        description: "Read LibreOffice .odt XML content and parse legacy Rich Text Format (.rtf) files cleanly.",
      },
      {
        title: "Confidential Document Safety",
        description: "Contracts, resumes, and confidential legal documents stay on your machine — zero risk of data leaks.",
      },
    ],
    faqs: [
      {
        question: "Can I convert Word DOCX to PDF without Microsoft Office installed?",
        answer: "Yes, our client-side parser reads the Word document structure and compiles it into an A4 PDF document directly.",
      },
      {
        question: "Is it safe to convert private legal contracts here?",
        answer: "Completely safe. Unlike cloud services, your file is processed in browser memory and never uploaded to any server.",
      },
    ],
  },

  spreadsheet: {
    id: "spreadsheet",
    slug: "spreadsheet",
    name: "Spreadsheets & Data Converter",
    shortName: "Spreadsheets",
    tagline: "Convert CSV, TSV, JSON, XLSX & Excel spreadsheets bidirectionally",
    description:
      "Cross-convert tabular data between Excel (.xlsx), CSV, TSV, and JSON formats. Generate real Excel workbooks and parse complex spreadsheets with instant structured preview.",
    icon: "Table",
    formatIds: ["csv", "tsv", "json", "xlsx"],
    defaultInput: "csv",
    defaultOutput: "xlsx",
    popularPairs: [
      { from: "csv", to: "xlsx", name: "CSV to Excel (XLSX)" },
      { from: "xlsx", to: "csv", name: "Excel (XLSX) to CSV" },
      { from: "csv", to: "json", name: "CSV to JSON" },
      { from: "json", to: "csv", name: "JSON to CSV" },
      { from: "tsv", to: "csv", name: "TSV to CSV" },
      { from: "xlsx", to: "json", name: "Excel (XLSX) to JSON" },
      { from: "json", to: "xlsx", name: "JSON to Excel (XLSX)" },
      { from: "csv", to: "html", name: "CSV to HTML Table" },
    ],
    features: [
      {
        title: "Excel .xlsx Generator",
        description: "Package CSV rows into a valid Microsoft Excel workbook XML structure with inline strings and worksheets.",
      },
      {
        title: "Shared Strings XML Parsing",
        description: "Read Excel files and resolve complex Shared Strings tables into 2D JSON and CSV tables.",
      },
      {
        title: "Developer-Friendly JSON",
        description: "Transform database dumps and API payloads between JSON arrays and spreadsheet rows in 1 click.",
      },
      {
        title: "Instant HTML Tables",
        description: "Generate styled HTML <table> code ready to embed in web pages and blog posts.",
      },
    ],
    faqs: [
      {
        question: "How do I convert a CSV file into an Excel (.xlsx) file?",
        answer: "Drop your CSV file into the converter, select XLSX as target, and click Convert. A real Excel workbook will be generated instantly.",
      },
      {
        question: "Can I convert JSON data from an API into a spreadsheet?",
        answer: "Yes, upload your .json array file and convert it into CSV, TSV, or XLSX ready to open in Excel or Google Sheets.",
      },
    ],
  },

  archive: {
    id: "archive",
    slug: "archive",
    name: "Archive Converter",
    shortName: "Archives",
    tagline: "Create, extract, and convert ZIP, TAR, 7Z, RAR compressed archives",
    description:
      "Compress files, repack archives, inspect file manifests, and convert between ZIP and TAR formats using in-browser deflate compression with customizable compression levels.",
    icon: "Archive",
    formatIds: ["zip", "tar", "7z", "rar"],
    defaultInput: "zip",
    defaultOutput: "tar",
    popularPairs: [
      { from: "zip", to: "tar", name: "ZIP to TAR" },
      { from: "tar", to: "zip", name: "TAR to ZIP" },
      { from: "rar", to: "zip", name: "RAR to ZIP" },
      { from: "7z", to: "zip", name: "7Z to ZIP" },
    ],
    features: [
      {
        title: "Client-Side Deflate Engine",
        description: "Compress files using standard DEFLATE algorithms with adjustable compression speeds (1 to 9).",
      },
      {
        title: "POSIX TAR Packaging",
        description: "Package file bundles into standard Unix/Linux TAR archive format.",
      },
      {
        title: "Multi-File Extraction",
        description: "Unpack archives and inspect individual files right in the browser without third-party software.",
      },
      {
        title: "No Archive Size Limits",
        description: "Process archives limited only by your computer's RAM, without restrictive cloud file upload limits.",
      },
    ],
    faqs: [
      {
        question: "Can I convert a ZIP file to TAR online?",
        answer: "Yes, drop your ZIP file, choose TAR as the output, and download your Unix-compatible TAR archive immediately.",
      },
      {
        question: "Do I need WinRAR or 7-Zip installed?",
        answer: "No, OmniTools runs decompression and recompression algorithms directly in your web browser.",
      },
    ],
  },

  "vector-fonts": {
    id: "vector-fonts",
    slug: "vector-fonts",
    name: "Vector, Ebooks & Fonts Converter",
    shortName: "Vector & Fonts",
    tagline: "Convert SVG vectors, EPUB ebooks, MOBI, TTF and WOFF2 web fonts",
    description:
      "Rasterize SVG vectors to crisp PNG or WebP images, extract e-book chapters from EPUB files into HTML, Text, or PDF, and convert between web and desktop typography standards.",
    icon: "Feather",
    formatIds: ["svg", "epub", "mobi", "ttf", "woff2"],
    defaultInput: "svg",
    defaultOutput: "png",
    popularPairs: [
      { from: "svg", to: "png", name: "SVG to PNG" },
      { from: "svg", to: "webp", name: "SVG to WebP" },
      { from: "svg", to: "pdf", name: "SVG to PDF" },
      { from: "epub", to: "pdf", name: "EPUB to PDF" },
      { from: "epub", to: "html", name: "EPUB to HTML" },
      { from: "epub", to: "txt", name: "EPUB to Text" },
      { from: "ttf", to: "woff2", name: "TTF to WOFF2" },
    ],
    features: [
      {
        title: "High-DPI Vector Rasterization",
        description: "Convert scalable vector graphics (SVG) into sharp raster images at any custom dimension without blurriness.",
      },
      {
        title: "EPUB Chapter Extractor",
        description: "Parse EPUB electronic books, extract XML/XHTML chapters, and output them as unified HTML or printable PDF documents.",
      },
      {
        title: "Modern Web Typography",
        description: "Prepare and inspect desktop TrueType (TTF) and next-generation WOFF2 web font assets.",
      },
      {
        title: "Complete Digital Privacy",
        description: "Your proprietary vector logos, illustrations, and manuscripts never leave your workstation.",
      },
    ],
    faqs: [
      {
        question: "How do I convert an SVG logo into a PNG with a transparent background?",
        answer: "Upload your SVG file, select PNG as the output format, and download your transparent PNG image rendered at full fidelity.",
      },
      {
        question: "Can I read or convert EPUB e-books to PDF?",
        answer: "Yes, our EPUB parser extracts the chapters from the EPUB container and compiles them into a clean, readable PDF document.",
      },
    ],
  },
};

export function getAllCategories(): CategoryDefinition[] {
  return Object.values(CATEGORIES_REGISTRY);
}

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORIES_REGISTRY[slug.toLowerCase()];
}

export function getFormatsForCategory(category: CategoryDefinition): FormatDefinition[] {
  return category.formatIds
    .map((id) => getFormatById(id))
    .filter((f): f is FormatDefinition => f !== undefined);
}
