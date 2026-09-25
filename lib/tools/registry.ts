export type ToolCategory =
  | "pdf"
  | "image"
  | "calculators"
  | "text"
  | "productivity";

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  path: string;
}

export interface HowToStep {
  title: string;
  desc: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ToolItem {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: ToolCategory;
  categoryName: string;
  path: string;
  icon: string;
  keywords: string[];
  badges?: Array<"popular" | "new" | "featured">;
  relatedToolIds: string[];
  features: string[];
  howToSteps: HowToStep[];
  faqs: FAQ[];
  supportedFormats?: string[];
  limitations?: string[];
  status: "ready" | "beta";
}

export const CATEGORIES: Record<ToolCategory, CategoryInfo> = {
  pdf: {
    id: "pdf",
    name: "PDF Tools",
    description: "Merge, split, compress, convert, rotate, and manage your PDF documents 100% in your browser.",
    icon: "FileText",
    path: "/tools/pdf",
  },
  image: {
    id: "image",
    name: "Image Tools",
    description: "Compress, resize, convert, crop, view metadata, and edit images without uploading files.",
    icon: "Image",
    path: "/tools/image",
  },
  calculators: {
    id: "calculators",
    name: "Calculators & Converters",
    description: "Instant percentage, discount, age, date, financial calculators and comprehensive unit conversions.",
    icon: "Calculator",
    path: "/tools/calculators",
  },
  text: {
    id: "text",
    name: "Text Tools",
    description: "Accurate word count, reading time, and comprehensive text case conversions.",
    icon: "Type",
    path: "/tools/text",
  },
  productivity: {
    id: "productivity",
    name: "Productivity Tools",
    description: "Generate QR codes, hash strings, passwords, and encode/decode Base64 securely.",
    icon: "Zap",
    path: "/tools/productivity",
  },
};

export const TOOLS_REGISTRY: ToolItem[] = [
  // --- PDF TOOLS ---
  {
    id: "merge-pdf",
    name: "Merge PDF",
    shortDescription: "Combine multiple PDF documents into a single organized file in seconds.",
    longDescription: "Easily merge two or more PDF files into a single unified document with custom drag-and-drop page ordering. Runs 100% locally in your browser for absolute confidentiality.",
    category: "pdf",
    categoryName: "PDF Tools",
    path: "/tools/pdf/merge",
    icon: "Layers",
    keywords: ["merge pdf", "combine pdf", "join pdf", "unite pdf", "concatenate pdfs"],
    badges: ["popular", "featured"],
    relatedToolIds: ["split-pdf", "organize-pdf", "compress-pdf"],
    features: [
      "Drag-and-drop reordering of multiple files",
      "Page count and file size display per document",
      "Accessible move-up and move-down buttons",
      "Zero server uploads: 100% browser-based security",
      "Fast client-side assembly with pdf-lib"
    ],
    howToSteps: [
      { title: "Select or drop PDFs", desc: "Upload 2 or more PDF documents you wish to combine." },
      { title: "Reorder documents", desc: "Drag and drop or use the arrow buttons to arrange the desired page sequence." },
      { title: "Click Merge and download", desc: "Click 'Merge PDF' to generate and immediately download the combined file." }
    ],
    faqs: [
      { question: "Are my confidential files uploaded to your server?", answer: "No. All PDF operations happen locally inside your browser's memory using WebAssembly and JavaScript. No document ever leaves your device." },
      { question: "Is there a limit on how many PDFs I can merge?", answer: "There is no arbitrary limit. You can merge as many files as your device's browser memory permits." }
    ],
    supportedFormats: ["PDF (.pdf)"],
    status: "ready",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    shortDescription: "Extract specific page ranges or break down a PDF into individual files.",
    longDescription: "Split large PDF documents into distinct files by specifying custom page ranges (e.g. 1-3, 5, 8-10), splitting every N pages, or extracting each page individually. Download individual parts or a ZIP archive.",
    category: "pdf",
    categoryName: "PDF Tools",
    path: "/tools/pdf/split",
    icon: "Scissors",
    keywords: ["split pdf", "extract pdf pages", "separate pdf", "break pdf", "cut pdf"],
    badges: ["popular"],
    relatedToolIds: ["merge-pdf", "organize-pdf", "rotate-pdf"],
    features: [
      "Custom page range extraction (e.g., '1-4, 7, 9-12')",
      "Split every N pages or into separate single-page documents",
      "Instant ZIP download or per-file download",
      "Input syntax validation with real-time feedback",
      "Preserves original quality and vector elements"
    ],
    howToSteps: [
      { title: "Upload your PDF", desc: "Select or drop the PDF file you want to split." },
      { title: "Configure split mode", desc: "Select custom ranges, fixed intervals, or all individual pages." },
      { title: "Process and save", desc: "Preview the generated sections and download as a ZIP or single files." }
    ],
    faqs: [
      { question: "Can I enter non-consecutive page ranges?", answer: "Yes, you can enter comma-separated ranges such as '1-3, 5, 7-10' and each range will be extracted into a separate document." }
    ],
    supportedFormats: ["PDF (.pdf)"],
    status: "ready",
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    shortDescription: "Reduce PDF file size while preserving readability and vector formatting.",
    longDescription: "Optimize PDF internal structures, deduplicate fonts and resources, and compress object streams to reduce file size without sending your data across the internet.",
    category: "pdf",
    categoryName: "PDF Tools",
    path: "/tools/pdf/compress",
    icon: "Minimize2",
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "optimize pdf"],
    badges: ["popular"],
    relatedToolIds: ["merge-pdf", "pdf-to-jpg"],
    features: [
      "Stream compression and object deduplication",
      "Before and after exact size comparison",
      "Calculated percentage file reduction",
      "Honest reporting: alerts if file is already optimal",
      "100% client-side execution"
    ],
    howToSteps: [
      { title: "Upload PDF", desc: "Select the PDF file you want to reduce in size." },
      { title: "Run optimization", desc: "The engine analyzes and compresses redundant streams." },
      { title: "Download optimized file", desc: "Inspect the size reduction and download the resulting file." }
    ],
    faqs: [
      { question: "Why might some PDFs not shrink significantly?", answer: "PDFs that already have highly compressed image streams or consist mainly of raw scanned photos might already be near maximum compression without lossy raster downsampling." }
    ],
    supportedFormats: ["PDF (.pdf)"],
    status: "ready",
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG & PNG",
    shortDescription: "Convert PDF pages into high-resolution JPG or PNG images.",
    longDescription: "Render PDF document pages into crisp raster images. Choose your preferred output resolution (150 DPI, 300 DPI) and image format. Download individual pages or download all as a ZIP archive.",
    category: "pdf",
    categoryName: "PDF Tools",
    path: "/tools/pdf/pdf-to-jpg",
    icon: "FileImage",
    keywords: ["pdf to jpg", "pdf to image", "pdf to png", "convert pdf to picture"],
    badges: ["popular"],
    relatedToolIds: ["jpg-to-pdf", "split-pdf", "image-converter"],
    features: [
      "High-resolution rendering with custom scale",
      "Choice of JPG or PNG output format",
      "Adjustable JPG compression quality",
      "Page selector: convert specific pages or entire document",
      "Instant ZIP export for multiple pages"
    ],
    howToSteps: [
      { title: "Upload PDF", desc: "Select the PDF document." },
      { title: "Choose format & quality", desc: "Select JPG or PNG and preferred rendering DPI." },
      { title: "Convert & download", desc: "Render all pages and download individual images or full ZIP." }
    ],
    faqs: [
      { question: "Is text rendered cleanly?", answer: "Yes, the canvas renderer draws vector fonts and paths at high pixel densities to preserve crispness." }
    ],
    supportedFormats: ["PDF (.pdf)"],
    status: "ready",
  },
  {
    id: "jpg-to-pdf",
    name: "JPG & PNG to PDF",
    shortDescription: "Turn multiple images into a beautiful, organized PDF document.",
    longDescription: "Convert multiple JPG, PNG, and WebP images into a single professional PDF. Customize page size (A4, Letter, Auto/Fit), orientation, margins, and layout order.",
    category: "pdf",
    categoryName: "PDF Tools",
    path: "/tools/pdf/jpg-to-pdf",
    icon: "FilePlus",
    keywords: ["jpg to pdf", "png to pdf", "image to pdf", "photos to pdf", "convert images to pdf"],
    badges: ["popular"],
    relatedToolIds: ["pdf-to-jpg", "merge-pdf"],
    features: [
      "Batch upload multiple images at once",
      "A4, US Letter, and Fit-to-Image page sizes",
      "Portrait, Landscape, or Auto orientation",
      "Customizable margins and background color",
      "Drag-and-drop image reordering"
    ],
    howToSteps: [
      { title: "Add images", desc: "Upload your photos or screenshots (JPG, PNG, WebP)." },
      { title: "Customize layout", desc: "Select page size, orientation, margins, and arrange image order." },
      { title: "Generate PDF", desc: "Click create to generate and download the PDF." }
    ],
    faqs: [
      { question: "Are my photos compressed when converting?", answer: "Images are embedded directly at their original quality without unnecessary re-compression artifacts." }
    ],
    supportedFormats: ["JPG (.jpg, .jpeg)", "PNG (.png)", "WebP (.webp)"],
    status: "ready",
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF Pages",
    shortDescription: "Permanently rotate all or specific pages in your PDF document.",
    longDescription: "Fix upside-down or sideways pages in your PDF. Rotate 90°, 180°, or 270° clockwise or counterclockwise. Apply rotation to selected pages or across the entire document.",
    category: "pdf",
    categoryName: "PDF Tools",
    path: "/tools/pdf/rotate",
    icon: "RotateCw",
    keywords: ["rotate pdf", "turn pdf", "fix upside down pdf", "flip pdf pages"],
    relatedToolIds: ["organize-pdf", "split-pdf"],
    features: [
      "Rotate all pages simultaneously or individual pages",
      "90°, 180°, and 270° rotation angles",
      "Live visual orientation indicator",
      "Fast lossless page transformation",
      "Instant PDF download"
    ],
    howToSteps: [
      { title: "Upload PDF", desc: "Select your PDF document." },
      { title: "Set rotation", desc: "Choose whether to rotate all pages or specific page numbers." },
      { title: "Save changes", desc: "Download the updated PDF with permanent rotation applied." }
    ],
    faqs: [
      { question: "Does rotating degrade document quality?", answer: "No, rotation modifies the PDF viewport metadata without touching the underlying vector content or raster streams." }
    ],
    supportedFormats: ["PDF (.pdf)"],
    status: "ready",
  },
  {
    id: "organize-pdf",
    name: "Organize PDF Pages",
    shortDescription: "Rearrange, delete, duplicate, and rotate individual pages visually.",
    longDescription: "Take full control of your PDF page flow. View page thumbnails, drag to reorder, delete unwanted pages, duplicate important pages, and rotate individual sheets.",
    category: "pdf",
    categoryName: "PDF Tools",
    path: "/tools/pdf/organize",
    icon: "Grid",
    keywords: ["organize pdf", "reorder pdf pages", "delete pdf pages", "rearrange pdf"],
    relatedToolIds: ["rotate-pdf", "split-pdf", "merge-pdf"],
    features: [
      "Visual page grid with page numbers",
      "Accessible move forward and move backward controls",
      "One-click page deletion and page duplication",
      "Individual page rotation controls",
      "Client-side processing with instant download"
    ],
    howToSteps: [
      { title: "Open PDF", desc: "Upload your document to load page tiles." },
      { title: "Reorder & manage", desc: "Move pages up/down, delete unwanted ones, or duplicate sheets." },
      { title: "Export document", desc: "Click Save to build and download the newly structured PDF." }
    ],
    faqs: [
      { question: "Can I remove multiple pages at once?", answer: "Yes, simply click the delete button on any unwanted pages in the grid before downloading." }
    ],
    supportedFormats: ["PDF (.pdf)"],
    status: "ready",
  },
  {
    id: "pdf-page-number",
    name: "PDF Page Numbering",
    shortDescription: "Add custom page numbers to headers or footers with full styling control.",
    longDescription: "Stamp professional page numbers onto your PDF documents. Choose positions (top/bottom, left/center/right), starting number, format ('Page {n} of {total}', 'Page {n}', '{n}'), font size, and color.",
    category: "pdf",
    categoryName: "PDF Tools",
    path: "/tools/pdf/page-number",
    icon: "Hash",
    keywords: ["add page numbers to pdf", "pdf page number", "number pdf", "paginate pdf"],
    relatedToolIds: ["pdf-watermark", "merge-pdf"],
    features: [
      "Flexible placements: 6 header and footer positions",
      "Templates: 'Page {n} of {total}', 'Page {n}', or plain '{n}'",
      "Configurable starting number",
      "Option to skip the cover page (first page)",
      "Custom font size, color, and margin offsets"
    ],
    howToSteps: [
      { title: "Upload document", desc: "Select the PDF file you want to paginate." },
      { title: "Configure format", desc: "Pick position, numbering style, font size, and options." },
      { title: "Download", desc: "Generate the paginated PDF instantly." }
    ],
    faqs: [
      { question: "Can I start numbering from page 2?", answer: "Yes, you can check 'Skip first page' so your title/cover page remains unnumbered." }
    ],
    supportedFormats: ["PDF (.pdf)"],
    status: "ready",
  },
  {
    id: "pdf-watermark",
    name: "PDF Watermark",
    shortDescription: "Stamp custom text watermarks onto PDF pages with custom opacity and rotation.",
    longDescription: "Protect your confidential documents or mark drafts. Add custom text watermarks with control over placement (center or tiled diagonal), rotation angle, opacity, font size, and color.",
    category: "pdf",
    categoryName: "PDF Tools",
    path: "/tools/pdf/watermark",
    icon: "Stamp",
    keywords: ["watermark pdf", "add watermark to pdf", "draft stamp pdf", "confidential watermark"],
    relatedToolIds: ["pdf-page-number", "organize-pdf"],
    features: [
      "Custom text (e.g. 'CONFIDENTIAL', 'DRAFT', 'DO NOT COPY')",
      "Adjustable opacity slider and rotation angles (-45°, 0°, 45°)",
      "Single centered or repeating pattern modes",
      "Custom text color and font size",
      "Instant browser-side application"
    ],
    howToSteps: [
      { title: "Upload PDF", desc: "Select the document to watermark." },
      { title: "Customize text & style", desc: "Type your watermark text, set angle, opacity, and color." },
      { title: "Download watermarked PDF", desc: "Apply the watermark and download immediately." }
    ],
    faqs: [
      { question: "Can the watermark text be removed by viewers?", answer: "The text is stamped directly into the PDF content stream. Standard readers cannot easily strip it." }
    ],
    supportedFormats: ["PDF (.pdf)"],
    status: "ready",
  },
  {
    id: "pdf-metadata",
    name: "PDF Metadata Viewer & Editor",
    shortDescription: "Inspect, edit, or strip hidden document metadata for privacy.",
    longDescription: "View hidden metadata embedded in PDF files including Title, Author, Subject, Keywords, Creator, Producer, and Creation Date. Edit properties or use the one-click Strip Metadata feature to sanitize files before sharing.",
    category: "pdf",
    categoryName: "PDF Tools",
    path: "/tools/pdf/metadata",
    icon: "Info",
    keywords: ["pdf metadata", "view pdf metadata", "remove pdf metadata", "clean pdf", "sanitize pdf"],
    relatedToolIds: ["compress-pdf", "image-metadata"],
    features: [
      "Inspect Title, Author, Subject, Creator, Producer, and Dates",
      "Edit metadata properties directly",
      "One-click 'Sanitize & Strip All Metadata' export",
      "File size and page count diagnostics",
      "100% private browser-based processing"
    ],
    howToSteps: [
      { title: "Upload PDF", desc: "Select any PDF to read its document information dictionary." },
      { title: "View or modify fields", desc: "Review metadata or update fields as desired." },
      { title: "Export clean file", desc: "Download the updated or completely sanitized PDF." }
    ],
    faqs: [
      { question: "Why should I strip PDF metadata?", answer: "Documents often contain internal software names, author usernames, and corporate computer paths that you may not want to disclose publicly." }
    ],
    supportedFormats: ["PDF (.pdf)"],
    status: "ready",
  },

  // --- IMAGE TOOLS ---
  {
    id: "image-compressor",
    name: "Image Compressor",
    shortDescription: "Compress JPG, PNG, and WebP images with adjustable quality.",
    longDescription: "Shrink image file sizes without sacrificing visual sharpness. Adjust compression quality, convert format, inspect real-time before/after byte comparisons, and process files in batch with ZIP download.",
    category: "image",
    categoryName: "Image Tools",
    path: "/tools/image/compress",
    icon: "FileDown",
    keywords: ["compress image", "reduce image size", "shrink photo", "jpg compressor", "png compressor"],
    badges: ["popular", "featured"],
    relatedToolIds: ["image-resizer", "image-converter", "crop-rotate"],
    features: [
      "Supports JPG, PNG, and modern WebP formats",
      "Quality slider with real-time compression preview",
      "Accurate byte savings and percentage calculation",
      "Batch queue processing with ZIP archive download",
      "Alpha channel / transparency preservation"
    ],
    howToSteps: [
      { title: "Upload images", desc: "Drop or select one or multiple images." },
      { title: "Adjust quality", desc: "Use the slider to balance visual clarity and file size." },
      { title: "Download results", desc: "Save individual images or download all as a ZIP archive." }
    ],
    faqs: [
      { question: "Is WebP compression better than JPG?", answer: "Yes, WebP typically achieves 25-35% smaller file sizes than standard JPEG at equivalent visual quality." }
    ],
    supportedFormats: ["JPG (.jpg, .jpeg)", "PNG (.png)", "WebP (.webp)"],
    status: "ready",
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    shortDescription: "Resize images to exact pixel dimensions, percentages, or social presets.",
    longDescription: "Resize single or multiple photos to custom dimensions with aspect ratio lock, percentage scaling, or popular social media presets (Instagram, YouTube, Twitter/X, LinkedIn, Facebook).",
    category: "image",
    categoryName: "Image Tools",
    path: "/tools/image/resize",
    icon: "Scaling",
    keywords: ["resize image", "scale image", "change image size", "photo dimensions", "instagram size"],
    badges: ["popular"],
    relatedToolIds: ["image-compressor", "crop-rotate"],
    features: [
      "Custom pixel width and height with aspect ratio lock",
      "Percentage scaling (25%, 50%, 75%, 200%)",
      "Social media presets (Instagram Post/Story, YouTube Thumbnail, etc.)",
      "Fit modes: Contain, Cover, or Stretch",
      "High quality canvas bicubic interpolation"
    ],
    howToSteps: [
      { title: "Upload photo", desc: "Select the image you want to resize." },
      { title: "Choose dimensions", desc: "Enter custom pixels or select a convenient social media preset." },
      { title: "Download", desc: "Download the resized image in your preferred format." }
    ],
    faqs: [
      { question: "Will my image look blurry if enlarged?", answer: "Raster images lose sharpness when upscaled significantly. For best results, resize downwards or keep scaling within 150%." }
    ],
    supportedFormats: ["JPG (.jpg, .jpeg)", "PNG (.png)", "WebP (.webp)"],
    status: "ready",
  },
  {
    id: "image-converter",
    name: "Image Converter",
    shortDescription: "Convert between JPG, PNG, WebP, and AVIF image formats.",
    longDescription: "Easily switch image formats while preserving transparency where supported. Batch convert dozens of images with configurable quality settings and download everything in a clean ZIP bundle.",
    category: "image",
    categoryName: "Image Tools",
    path: "/tools/image/convert",
    icon: "RefreshCw",
    keywords: ["convert image", "png to jpg", "jpg to png", "webp to jpg", "image format converter"],
    badges: ["popular"],
    relatedToolIds: ["image-compressor", "jpg-to-pdf"],
    features: [
      "Interchangeable conversion between JPG, PNG, and WebP",
      "Smart alpha-to-color blending when converting transparent PNG to JPG",
      "Configurable output quality",
      "Batch processing with single-click ZIP download",
      "No uploads, 100% private in-browser processing"
    ],
    howToSteps: [
      { title: "Upload images", desc: "Select one or more images in any supported format." },
      { title: "Select target format", desc: "Choose PNG, JPG, or WebP and adjust quality if desired." },
      { title: "Convert & download", desc: "Download converted files individually or as a complete ZIP." }
    ],
    faqs: [
      { question: "What happens to transparency when converting PNG to JPG?", answer: "Since JPEG does not support alpha channels, transparent areas are smoothly filled with a clean white background." }
    ],
    supportedFormats: ["JPG (.jpg, .jpeg)", "PNG (.png)", "WebP (.webp)"],
    status: "ready",
  },
  {
    id: "crop-rotate",
    name: "Crop & Rotate Image",
    shortDescription: "Crop, flip, and rotate photos with aspect ratio presets.",
    longDescription: "Crop images with precision using freeform selection or standardized aspect ratio presets (1:1 Square, 4:3, 16:9, 3:2). Rotate 90 degrees or arbitrary angles, and flip horizontally or vertically.",
    category: "image",
    categoryName: "Image Tools",
    path: "/tools/image/crop-rotate",
    icon: "Crop",
    keywords: ["crop image", "rotate image", "flip image", "cut picture", "aspect ratio crop"],
    relatedToolIds: ["image-resizer", "image-compressor"],
    features: [
      "Standard aspect ratio presets (1:1, 4:3, 16:9, 3:2, Free)",
      "90-degree clockwise and counter-clockwise rotation",
      "Horizontal and vertical mirror flipping",
      "Arbitrary degree angle slider",
      "Instant canvas preview and full-res export"
    ],
    howToSteps: [
      { title: "Upload image", desc: "Open the image you wish to edit." },
      { title: "Adjust crop & orientation", desc: "Drag crop handles, select ratio presets, or rotate/flip." },
      { title: "Download cropped image", desc: "Export your edited picture directly." }
    ],
    faqs: [
      { question: "Can I reset my changes?", answer: "Yes, click the 'Reset' button anytime to restore the original dimensions and orientation." }
    ],
    supportedFormats: ["JPG (.jpg, .jpeg)", "PNG (.png)", "WebP (.webp)"],
    status: "ready",
  },
  {
    id: "image-metadata",
    name: "Image Metadata (EXIF) Viewer",
    shortDescription: "Read camera settings, GPS location, and technical EXIF details.",
    longDescription: "Inspect embedded EXIF data inside your photos. View camera make/model, lens, exposure time, F-stop aperture, ISO speed, focal length, date taken, and image dimensions. Export a sanitized image with EXIF stripped.",
    category: "image",
    categoryName: "Image Tools",
    path: "/tools/image/metadata",
    icon: "Camera",
    keywords: ["exif viewer", "image metadata", "photo details", "camera settings", "strip exif"],
    relatedToolIds: ["pdf-metadata", "image-compressor"],
    features: [
      "Extract Camera Make, Model, and Lens info",
      "Exposure, ISO, F-number, Focal Length, Shutter Speed",
      "Original Date & Time of capture",
      "Pixel dimensions, Megapixels, and Color Depth",
      "One-click 'Strip EXIF' sanitized download"
    ],
    howToSteps: [
      { title: "Upload photo", desc: "Select a JPG, WebP, or PNG file." },
      { title: "Review EXIF data", desc: "Inspect categorized camera, exposure, and technical details." },
      { title: "Sanitize if desired", desc: "Download a clean version without location or camera identifiers." }
    ],
    faqs: [
      { question: "Do PNGs have EXIF data?", answer: "Standard EXIF is predominantly used by JPEG and TIFF files from cameras and smartphones, though PNGs can contain metadata chunks." }
    ],
    supportedFormats: ["JPG (.jpg, .jpeg)", "PNG (.png)", "WebP (.webp)"],
    status: "ready",
  },
  {
    id: "background-remover",
    name: "Background Remover",
    shortDescription: "Isolate subjects and create transparent PNGs with smart edge detection.",
    longDescription: "Remove solid or contrasting backgrounds from product shots, signatures, icons, and photos directly in your browser. Fine-tune color tolerance and edge feathering for clean transparent cutouts.",
    category: "image",
    categoryName: "Image Tools",
    path: "/tools/image/background-remover",
    icon: "Eraser",
    keywords: ["remove background", "transparent png", "background eraser", "cutout photo"],
    badges: ["featured"],
    relatedToolIds: ["image-compressor", "crop-rotate"],
    features: [
      "Smart browser-based edge & color segmentation",
      "Tolerance and feather smoothing sliders",
      "Interactive color picker to select background hue",
      "Instant side-by-side transparent checkerboard preview",
      "Download high-res transparent PNG"
    ],
    howToSteps: [
      { title: "Upload photo", desc: "Select an image with a distinct subject or background." },
      { title: "Refine cutout", desc: "Click background or adjust tolerance slider for optimal edges." },
      { title: "Download PNG", desc: "Save the subject with an alpha transparent background." }
    ],
    faqs: [
      { question: "Are my photos sent to a third-party AI server?", answer: "No, all segmentation and pixel processing runs client-side inside your browser." }
    ],
    supportedFormats: ["JPG (.jpg, .jpeg)", "PNG (.png)", "WebP (.webp)"],
    status: "ready",
  },

  // --- CALCULATORS & CONVERTERS ---
  {
    id: "percentage-calculator",
    name: "Percentage Calculator",
    shortDescription: "Solve any percentage problem with formulas and step-by-step math.",
    longDescription: "Comprehensive percentage calculator offering 6 distinct modes: What is X% of Y? X is what percent of Y? Percentage increase/decrease between two values, percentage difference, and calculating original values.",
    category: "calculators",
    categoryName: "Calculators & Converters",
    path: "/tools/calculators/percentage",
    icon: "Percent",
    keywords: ["percentage calculator", "percent increase", "percent decrease", "calculate percentage"],
    badges: ["popular", "featured"],
    relatedToolIds: ["discount-calculator", "sales-tax-calculator", "profit-margin-calculator"],
    features: [
      "6 specialized calculation modes",
      "Step-by-step mathematical explanation & formula display",
      "Instant calculation as you type",
      "Supports positive, negative, and decimal values",
      "Quick copy result action"
    ],
    howToSteps: [
      { title: "Select mode", desc: "Choose the type of percentage problem you want to solve." },
      { title: "Enter values", desc: "Input your numbers into the respective fields." },
      { title: "View result & formula", desc: "Get the exact answer with the full mathematical solution." }
    ],
    faqs: [
      { question: "What is the difference between percentage change and percentage difference?", answer: "Percentage change calculates growth or decline relative to the starting original value, whereas percentage difference compares two values relative to their average." }
    ],
    status: "ready",
  },
  {
    id: "discount-calculator",
    name: "Discount Calculator",
    shortDescription: "Calculate sale prices, savings amount, and final total with sales tax.",
    longDescription: "Calculate the exact discounted price, money saved, and total payable with optional additional coupons and sales tax. Perfect for shopping sales and retail analysis.",
    category: "calculators",
    categoryName: "Calculators & Converters",
    path: "/tools/calculators/discount",
    icon: "Tag",
    keywords: ["discount calculator", "sale calculator", "price off", "savings calculator", "clearance calculator"],
    badges: ["popular"],
    relatedToolIds: ["percentage-calculator", "sales-tax-calculator"],
    features: [
      "Percentage discount or fixed amount off",
      "Stackable secondary coupon discount",
      "Configurable sales tax calculation",
      "Complete savings summary & breakdown",
      "Clear order of operations"
    ],
    howToSteps: [
      { title: "Enter original price", desc: "Type in the retail or list price." },
      { title: "Input discount & tax", desc: "Enter the percentage off and any applicable tax rate." },
      { title: "View your total savings", desc: "See the final price and exactly how much money you save." }
    ],
    faqs: [
      { question: "Is tax applied before or after the discount?", answer: "By default, sales tax is calculated on the discounted price (the actual amount paid), which is standard in most jurisdictions." }
    ],
    status: "ready",
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    shortDescription: "Calculate exact age in years, months, days, and next birthday countdown.",
    longDescription: "Find exact chronological age down to days, hours, and minutes. Correctly accounts for leap years, days in each calendar month, and shows a countdown to the next birthday.",
    category: "calculators",
    categoryName: "Calculators & Converters",
    path: "/tools/calculators/age",
    icon: "Calendar",
    keywords: ["age calculator", "how old am i", "chronological age", "birthday countdown", "date of birth"],
    relatedToolIds: ["date-calculator"],
    features: [
      "Exact age in Years, Months, and Days",
      "Total days, total hours, and total minutes lived",
      "Day of the week of birth (e.g. 'Born on a Tuesday')",
      "Live countdown to next birthday",
      "Accurate leap year handling"
    ],
    howToSteps: [
      { title: "Enter birth date", desc: "Pick your date of birth from the calendar." },
      { title: "Optional reference date", desc: "Defaults to today, or choose a custom target date." },
      { title: "View breakdown", desc: "See your comprehensive age breakdown and milestones." }
    ],
    faqs: [
      { question: "Does this accurately handle February 29th leap birthdays?", answer: "Yes, leap year birthdays are correctly handled according to standard chronological conventions." }
    ],
    status: "ready",
  },
  {
    id: "date-calculator",
    name: "Date Calculator",
    shortDescription: "Calculate duration between dates and compute business working days.",
    longDescription: "Compute the number of calendar days, weeks, months, or working business days between two dates. Add or subtract duration from a date with customizable weekend days and holidays.",
    category: "calculators",
    categoryName: "Calculators & Converters",
    path: "/tools/calculators/date",
    icon: "CalendarDays",
    keywords: ["date calculator", "days between dates", "business days", "working days calculator", "add days to date"],
    relatedToolIds: ["age-calculator"],
    features: [
      "Calendar days between two dates",
      "Working business days calculation with configurable weekends",
      "Add or subtract days, weeks, or months to any date",
      "Inclusive or exclusive date counting options",
      "Instant copy result"
    ],
    howToSteps: [
      { title: "Choose operation", desc: "Select 'Days Between' or 'Add/Subtract Time'." },
      { title: "Input dates", desc: "Select start and end dates or enter day intervals." },
      { title: "Get duration", desc: "Review the exact calendar and business day counts." }
    ],
    faqs: [
      { question: "What counts as a working day?", answer: "By default, Monday through Friday are working days, but you can toggle weekend days according to your work week." }
    ],
    status: "ready",
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    shortDescription: "Convert between 10 measurement categories including Length, Weight, Temp, and Area.",
    longDescription: "A versatile unit conversion hub covering Length, Weight/Mass, Temperature, Area, Volume, Speed, Time, Digital Storage, Energy, and Pressure. Features searchable units and precision controls.",
    category: "calculators",
    categoryName: "Calculators & Converters",
    path: "/tools/calculators/unit-converter",
    icon: "ArrowLeftRight",
    keywords: ["unit converter", "convert units", "metric to imperial", "length converter", "weight converter"],
    badges: ["popular", "featured"],
    relatedToolIds: ["percentage-calculator"],
    features: [
      "10 comprehensive measurement categories",
      "Instant unit swap button",
      "Configurable decimal precision (0 to 8 places)",
      "Mathematical formula and conversion factor display",
      "One-click copy result"
    ],
    howToSteps: [
      { title: "Select category", desc: "Pick Length, Weight, Temperature, Storage, etc." },
      { title: "Enter value and units", desc: "Select 'From' and 'To' units and type your value." },
      { title: "View conversion", desc: "Instant conversion with formula details." }
    ],
    faqs: [
      { question: "Are conversions exact?", answer: "Yes, standard conversion constants (NIST and ISO standards) are used with double-precision floating point math." }
    ],
    status: "ready",
  },
  {
    id: "bmi-calculator",
    name: "BMI Calculator",
    shortDescription: "Calculate Body Mass Index (BMI) and discover your healthy weight range.",
    longDescription: "Calculate Body Mass Index (BMI) using metric (cm/kg) or imperial (feet/inches/lbs) units. View WHO classification categories (Underweight, Normal, Overweight, Obese) and ideal weight guidelines.",
    category: "calculators",
    categoryName: "Calculators & Converters",
    path: "/tools/calculators/bmi",
    icon: "Heart",
    keywords: ["bmi calculator", "body mass index", "healthy weight", "ideal weight calculator"],
    relatedToolIds: ["unit-converter", "age-calculator"],
    features: [
      "Metric (kg, cm) and Imperial (lbs, ft, in) unit modes",
      "Visual BMI classification scale",
      "Healthy weight range recommendation for your height",
      "Clear medical information disclaimer",
      "No health data ever leaves your device"
    ],
    howToSteps: [
      { title: "Select unit system", desc: "Choose Metric or Imperial." },
      { title: "Input height and weight", desc: "Enter your current measurements." },
      { title: "Review results", desc: "View your BMI score and health category." }
    ],
    faqs: [
      { question: "Is BMI a diagnostic tool?", answer: "No, BMI is a statistical screening measure of body mass relative to height. It does not directly differentiate between muscle and fat mass." }
    ],
    status: "ready",
  },
  {
    id: "loan-calculator",
    name: "Loan Payment Calculator",
    shortDescription: "Calculate monthly payments, total interest, and full amortization schedule.",
    longDescription: "Calculate monthly loan payments, total interest paid, and total cost of borrowing for mortgages, auto loans, or personal loans. View interactive amortization summaries.",
    category: "calculators",
    categoryName: "Calculators & Converters",
    path: "/tools/calculators/loan",
    icon: "Coins",
    keywords: ["loan calculator", "mortgage calculator", "monthly payment", "interest calculator", "amortization"],
    badges: ["popular"],
    relatedToolIds: ["compound-interest-calculator", "profit-margin-calculator"],
    features: [
      "Standard fixed-rate amortization algorithm",
      "Monthly payment calculation",
      "Total interest vs principal breakdown",
      "Annual or monthly loan terms",
      "Clear financial estimate disclaimer"
    ],
    howToSteps: [
      { title: "Enter loan amount", desc: "Input the principal amount you are borrowing." },
      { title: "Set interest rate & term", desc: "Enter annual interest percentage and duration in years." },
      { title: "Review repayment", desc: "Inspect monthly installments, total interest, and repayment totals." }
    ],
    faqs: [
      { question: "Does this include property taxes or insurance?", answer: "This computes the baseline Principal and Interest (P&I) payment. Additional local escrow fees can be evaluated separately." }
    ],
    status: "ready",
  },
  {
    id: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    shortDescription: "Forecast investment growth with regular deposits and compounding frequency.",
    longDescription: "Visualize the power of compounding interest over time. Enter initial principal, regular monthly or annual contributions, annual return rate, and compounding intervals (Monthly, Quarterly, Annually).",
    category: "calculators",
    categoryName: "Calculators & Converters",
    path: "/tools/calculators/compound-interest",
    icon: "TrendingUp",
    keywords: ["compound interest calculator", "investment growth", "future value", "savings interest", "roi calculator"],
    badges: ["popular"],
    relatedToolIds: ["loan-calculator", "percentage-calculator"],
    features: [
      "Flexible compounding frequencies (Monthly, Quarterly, Annually)",
      "Optional regular monthly or yearly contributions",
      "Breakdown of Total Principal Invested vs Total Interest Earned",
      "Year-by-year forecast balance table",
      "Clear financial estimate disclaimer"
    ],
    howToSteps: [
      { title: "Set initial principal", desc: "Enter your starting balance." },
      { title: "Configure contributions & rate", desc: "Enter monthly addition, annual rate, and investment horizon." },
      { title: "View future balance", desc: "See your total portfolio value and interest multiplier." }
    ],
    faqs: [
      { question: "What is compounding frequency?", answer: "It is how often interest is calculated and added back to your principal balance to generate further interest." }
    ],
    status: "ready",
  },
  {
    id: "sales-tax-calculator",
    name: "Sales Tax Calculator",
    shortDescription: "Calculate sales tax forwards or reverse-calculate pre-tax amounts.",
    longDescription: "Easily add sales tax to a net price, or reverse-calculate the pre-tax cost and tax amount from a gross receipt total. Enter custom tax rates.",
    category: "calculators",
    categoryName: "Calculators & Converters",
    path: "/tools/calculators/sales-tax",
    icon: "Receipt",
    keywords: ["sales tax calculator", "vat calculator", "gst calculator", "tax inclusive", "tax exclusive"],
    relatedToolIds: ["discount-calculator", "percentage-calculator", "profit-margin-calculator"],
    features: [
      "Add tax mode (Net to Gross total)",
      "Reverse tax mode (Extract tax from Gross total)",
      "Displays Net Amount, Tax Amount, and Gross Total",
      "Custom tax rate percentages",
      "Copy breakdown results instantly"
    ],
    howToSteps: [
      { title: "Select mode", desc: "Choose 'Add Tax' or 'Extract Tax'." },
      { title: "Enter amount and rate", desc: "Input price and local tax percentage." },
      { title: "View breakdown", desc: "See clear line items for net, tax, and total." }
    ],
    faqs: [
      { question: "How is reverse sales tax calculated?", answer: "Pre-tax amount = Gross / (1 + Tax Rate). The tax amount is Gross - Pre-tax amount." }
    ],
    status: "ready",
  },
  {
    id: "profit-margin-calculator",
    name: "Profit Margin Calculator",
    shortDescription: "Calculate gross profit, profit margin percentage, and markup percentage.",
    longDescription: "Essential financial tool for ecommerce and retail. Input your cost and selling price to find gross profit, profit margin %, and markup %, or find target revenue from a desired margin.",
    category: "calculators",
    categoryName: "Calculators & Converters",
    path: "/tools/calculators/profit-margin",
    icon: "DollarSign",
    keywords: ["profit margin calculator", "markup calculator", "gross profit", "ecommerce margin", "margin vs markup"],
    relatedToolIds: ["sales-tax-calculator", "percentage-calculator"],
    features: [
      "Gross profit, margin %, and markup % calculations",
      "Target price mode: find selling price for desired margin",
      "Formulas and step-by-step math explained",
      "Instant responsive calculations",
      "Clear financial estimate disclaimer"
    ],
    howToSteps: [
      { title: "Enter cost & revenue", desc: "Input product cost and sale price." },
      { title: "View metrics", desc: "Instantly see gross profit in dollars, margin percentage, and markup percentage." }
    ],
    faqs: [
      { question: "What is the difference between Margin and Markup?", answer: "Margin is profit divided by revenue, whereas markup is profit divided by cost." }
    ],
    status: "ready",
  },

  // --- TEXT TOOLS ---
  {
    id: "word-counter",
    name: "Word Counter",
    shortDescription: "Real-time count of words, characters, sentences, paragraphs, and reading time.",
    longDescription: "Analyze written content with instant real-time statistics: word count, character count with and without spaces, sentences, paragraphs, estimated silent reading time, and speaking time.",
    category: "text",
    categoryName: "Text Tools",
    path: "/tools/text/word-counter",
    icon: "FileCheck",
    keywords: ["word counter", "character counter", "letter count", "reading time calculator", "text stats"],
    badges: ["popular"],
    relatedToolIds: ["case-converter"],
    features: [
      "Live word and character count (with & without spaces)",
      "Paragraph and sentence counts",
      "Estimated reading time (200 wpm) and speaking time (130 wpm)",
      "One-click copy text and clear text actions",
      "100% private in-browser analysis"
    ],
    howToSteps: [
      { title: "Type or paste", desc: "Enter or paste your text into the editor." },
      { title: "View metrics", desc: "All metrics update instantly in real time." }
    ],
    faqs: [
      { question: "Is my text saved on any server?", answer: "Never. Analysis runs directly in your browser session." }
    ],
    status: "ready",
  },
  {
    id: "case-converter",
    name: "Case Converter",
    shortDescription: "Transform text into UPPERCASE, lowercase, Title Case, camelCase, and more.",
    longDescription: "Quickly convert any text between popular casing styles: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, kebab-case, snake_case, and PascalCase.",
    category: "text",
    categoryName: "Text Tools",
    path: "/tools/text/case-converter",
    icon: "Type",
    keywords: ["case converter", "uppercase to lowercase", "title case", "camelcase converter", "snake case"],
    badges: ["popular"],
    relatedToolIds: ["word-counter"],
    features: [
      "8 casing styles: UPPER, lower, Title, Sentence, camelCase, kebab-case, snake_case, PascalCase",
      "Instant transformation with one click",
      "One-click copy to clipboard",
      "Preserves indentation and punctuation where appropriate"
    ],
    howToSteps: [
      { title: "Paste text", desc: "Insert your text into the input box." },
      { title: "Click casing button", desc: "Select your desired case format." },
      { title: "Copy output", desc: "Click copy to use the formatted text anywhere." }
    ],
    faqs: [
      { question: "What is Title Case?", answer: "Title Case capitalizes the first letter of major words while keeping short prepositions and articles lowercase." }
    ],
    status: "ready",
  },

  // --- PRODUCTIVITY TOOLS ---
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    shortDescription: "Generate custom QR codes for URLs, plain text, WiFi, and contact details.",
    longDescription: "Create clean, high-resolution QR codes for websites, plain text, WiFi network access, or email. Customize size, foreground color, background color, and download as PNG or SVG.",
    category: "productivity",
    categoryName: "Productivity Tools",
    path: "/tools/productivity/qr-code",
    icon: "QrCode",
    keywords: ["qr code generator", "make qr code", "wifi qr code", "url qr code", "free qr generator"],
    badges: ["popular", "featured"],
    relatedToolIds: ["base64-codec", "password-generator"],
    features: [
      "Support for URLs, Plain Text, and WiFi Network connection",
      "Customizable foreground and background colors",
      "High-resolution PNG and vector SVG downloads",
      "High error-correction level for reliable scanning",
      "No tracking, no expiration, no account required"
    ],
    howToSteps: [
      { title: "Choose type", desc: "Select URL, Text, or WiFi." },
      { title: "Enter content", desc: "Provide your destination link or credentials." },
      { title: "Download QR", desc: "Export crisp PNG or SVG files immediately." }
    ],
    faqs: [
      { question: "Do these QR codes expire?", answer: "No. These are static standard QR codes that encode your data directly. They never expire and require no external redirection." }
    ],
    status: "ready",
  },
  {
    id: "base64-codec",
    name: "Base64 Encoder & Decoder",
    shortDescription: "Encode text and files to Base64, or decode Base64 back into text.",
    longDescription: "Fast, reliable Base64 utility. Encode strings or small files into standard or URL-safe Base64. Decode Base64 strings with UTF-8 character encoding support and copy results with one click.",
    category: "productivity",
    categoryName: "Productivity Tools",
    path: "/tools/productivity/base64",
    icon: "Binary",
    keywords: ["base64 encode", "base64 decode", "base64 converter", "base64 to text"],
    relatedToolIds: ["hash-generator"],
    features: [
      "Standard and URL-safe Base64 modes",
      "Full UTF-8 Unicode character support",
      "Encode plain text or uploaded files",
      "Instant copy to clipboard",
      "Input validation with clear syntax error notifications"
    ],
    howToSteps: [
      { title: "Select mode", desc: "Choose Encode or Decode." },
      { title: "Input content", desc: "Type text or drop a file." },
      { title: "Copy result", desc: "Get your transformed Base64 string instantly." }
    ],
    faqs: [
      { question: "Does this support non-English characters?", answer: "Yes, our encoder uses full UTF-8 byte encoding so emojis and non-Latin scripts are accurately converted." }
    ],
    status: "ready",
  },
  {
    id: "hash-generator",
    name: "Cryptographic Hash Generator",
    shortDescription: "Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly.",
    longDescription: "Calculate cryptographic message digests using the native browser Web Crypto API. Support for SHA-256, SHA-512, SHA-384, SHA-1, and MD5. Verify checksums and compare hashes.",
    category: "productivity",
    categoryName: "Productivity Tools",
    path: "/tools/productivity/hash-generator",
    icon: "ShieldCheck",
    keywords: ["hash generator", "sha256 generator", "md5 generator", "sha512", "checksum calculator"],
    relatedToolIds: ["base64-codec", "password-generator"],
    features: [
      "Browser native Web Crypto API acceleration",
      "Supports SHA-256, SHA-512, SHA-384, SHA-1, and MD5",
      "Checksum comparator to verify file/string matches",
      "Uppercase and lowercase hex output",
      "One-click copy actions"
    ],
    howToSteps: [
      { title: "Input text", desc: "Type or paste your text to hash." },
      { title: "Select algorithm", desc: "Inspect all major hashing algorithm digests simultaneously." },
      { title: "Copy digest", desc: "Copy the hex output for verification." }
    ],
    faqs: [
      { question: "Are hashes computed locally?", answer: "Yes, all digests are computed directly in your browser using window.crypto.subtle." }
    ],
    status: "ready",
  },
  {
    id: "password-generator",
    name: "Secure Password Generator",
    shortDescription: "Generate cryptographically secure random passwords and passphrases.",
    longDescription: "Create strong, uncrackable passwords using the browser's cryptographically secure pseudo-random number generator (CSPRNG). Customize character sets, length, and check real-time entropy strength.",
    category: "productivity",
    categoryName: "Productivity Tools",
    path: "/tools/productivity/password-generator",
    icon: "KeyRound",
    keywords: ["password generator", "random password", "secure password", "strong password generator"],
    badges: ["popular"],
    relatedToolIds: ["hash-generator", "qr-code-generator"],
    features: [
      "Cryptographically secure randomness via window.crypto.getRandomValues",
      "Configurable length from 8 to 64 characters",
      "Include/exclude uppercase, lowercase, numbers, and symbols",
      "Option to avoid ambiguous characters (l, 1, I, O, 0)",
      "Real-time password entropy and crack-time indicator"
    ],
    howToSteps: [
      { title: "Choose length", desc: "Select your desired password length with the slider." },
      { title: "Toggle character sets", desc: "Enable or disable numbers, symbols, and uppercase." },
      { title: "Copy password", desc: "Click copy or regenerate for a fresh password." }
    ],
    faqs: [
      { question: "Are generated passwords stored or sent anywhere?", answer: "Never. Passwords are generated on-the-fly in browser RAM using CSPRNG and are never logged or stored." }
    ],
    status: "ready",
  },
  {
    id: "web-check",
    name: "Web-Check (Website Security & OSINT Inspector)",
    shortDescription: "Inspect SSL/TLS certificates, DNS records, security headers, and website health.",
    longDescription: "An all-in-one website intelligence and OSINT analysis tool powered by Web-Check. Inspect server IP, TLS/SSL certificates, DNS records (A, MX, TXT, NS), HTTP security headers (HSTS, CSP), and overall security posture.",
    category: "productivity",
    categoryName: "Productivity Tools",
    path: "/tools/productivity/web-check",
    icon: "Globe",
    keywords: ["web-check", "website security analyzer", "ssl checker", "dns records lookup", "security headers", "hsts", "csp", "osint"],
    badges: ["popular", "featured", "new"],
    relatedToolIds: ["hash-generator", "base64-codec", "qr-code-generator"],
    features: [
      "Instant DNS records lookup (A, AAAA, MX, TXT, NS, CNAME, SOA)",
      "SSL/TLS certificate audit with expiry countdown & cipher suites",
      "Comprehensive HTTP security headers audit (HSTS, CSP, X-Frame-Options, etc.)",
      "Automated security grading from A+ to F",
      "Server latency, status code & robots.txt detection",
      "Export full website audit report in JSON format"
    ],
    howToSteps: [
      { title: "Enter target domain", desc: "Type a domain or URL (e.g., github.com) into the analyzer bar." },
      { title: "Run scan", desc: "Click Analyze Domain to initiate DNS, SSL, and HTTP header inspections." },
      { title: "Review audit report", desc: "Inspect security grade, certificate validity, DNS records, and export reports." }
    ],
    faqs: [
      { question: "What is Web-Check?", answer: "Web-Check is a popular open-source OSINT and security reconnaissance utility for auditing domain infrastructure, SSL certificates, and security configurations." },
      { question: "Is my scan private?", answer: "Yes, our server analyzes only public DNS and HTTP response headers without recording user search history." }
    ],
    status: "ready",
  },
  {
    id: "omniget",
    name: "Any Video Downloader (Powered by yt-dlp)",
    shortDescription: "Download any video, audio track, and subtitles from 1,800+ sites powered by yt-dlp.",
    longDescription: "Free universal video downloader powered by the official yt-dlp media engine. Download 4K, 1080p, 720p MP4 videos, MP3 audio, and subtitles with one click.",
    category: "productivity",
    categoryName: "Productivity Tools",
    path: "/tools/productivity/omniget",
    icon: "Film",
    keywords: ["any video downloader", "video downloader", "yt-dlp", "youtube downloader", "tiktok downloader", "vimeo downloader", "twitter video downloader", "mp3 downloader"],
    badges: ["popular", "featured", "new"],
    relatedToolIds: ["web-check", "base64-codec", "qr-code-generator"],
    features: [
      "Powered by official yt-dlp media engine supporting 1,800+ sites",
      "Resolution selector from 4K Ultra HD down to 360p mobile",
      "High-fidelity MP3 (320 kbps) and AAC/M4A audio extraction",
      "Multi-language subtitle & closed captions (.srt and .vtt) extraction",
      "Interactive yt-dlp command generator with customizable flags",
      "Real-time download progress tracking with browser notifications"
    ],
    howToSteps: [
      { title: "Paste media link", desc: "Copy and paste any video or audio link into the input box." },
      { title: "Select format & quality", desc: "Choose desired resolution (4K, 1080p) or audio-only MP3/AAC." },
      { title: "Download instantly", desc: "Click the Download button to save the media directly to your device." }
    ],
    faqs: [
      { question: "How does Any Video Downloader work?", answer: "Any Video Downloader uses the powerful yt-dlp core engine to extract video streams, audio tracks, and subtitles from over 1,800 websites." },
      { question: "Can I download audio only?", answer: "Yes, you can extract high-quality MP3 (320 kbps) or AAC/M4A audio tracks directly." }
    ],
    status: "ready",
  },
];

// Helper functions for registry queries
export function getAllTools(): ToolItem[] {
  return TOOLS_REGISTRY;
}

export function getToolsByCategory(category: ToolCategory): ToolItem[] {
  return TOOLS_REGISTRY.filter((tool) => tool.category === category);
}

export function getToolById(id: string): ToolItem | undefined {
  return TOOLS_REGISTRY.find((tool) => tool.id === id);
}

export function getToolByPath(path: string): ToolItem | undefined {
  return TOOLS_REGISTRY.find((tool) => tool.path === path);
}

export function getRelatedTools(tool: ToolItem): ToolItem[] {
  const related = tool.relatedToolIds
    .map((id) => getToolById(id))
    .filter((t): t is ToolItem => t !== undefined);
  
  if (related.length < 3) {
    const categoryPeers = getToolsByCategory(tool.category).filter(
      (t) => t.id !== tool.id && !related.some((r) => r.id === t.id)
    );
    return [...related, ...categoryPeers].slice(0, 4);
  }
  return related.slice(0, 4);
}

export function getPopularTools(): ToolItem[] {
  return TOOLS_REGISTRY.filter((t) => t.badges?.includes("popular"));
}

export function searchTools(query: string): ToolItem[] {
  if (!query.trim()) return [];
  const normalized = query.toLowerCase().trim();
  const words = normalized.split(/\s+/);

  return TOOLS_REGISTRY.filter((tool) => {
    const nameMatch = tool.name.toLowerCase().includes(normalized);
    const catMatch = tool.categoryName.toLowerCase().includes(normalized);
    const descMatch = tool.shortDescription.toLowerCase().includes(normalized);
    const keywordMatch = tool.keywords.some((kw) =>
      words.every((w) => kw.toLowerCase().includes(w))
    );
    return nameMatch || catMatch || descMatch || keywordMatch;
  });
}
