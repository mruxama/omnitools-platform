import JSZip from "jszip";

/**
 * Downloads a single Blob with the specified filename.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Creates and downloads a ZIP file containing multiple files.
 * Protects against duplicate filenames by adding sequential increments.
 */
export async function downloadFilesAsZip(
  files: Array<{ name: string; blob: Blob }>,
  zipFilename: string = "omnitools_export.zip",
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const seenNames = new Map<string, number>();

  for (const item of files) {
    let finalName = item.name;
    const count = seenNames.get(finalName) || 0;

    if (count > 0) {
      const dotIndex = finalName.lastIndexOf(".");
      if (dotIndex !== -1) {
        finalName = `${finalName.substring(0, dotIndex)} (${count})${finalName.substring(dotIndex)}`;
      } else {
        finalName = `${finalName} (${count})`;
      }
    }
    seenNames.set(item.name, count + 1);

    zip.file(finalName, item.blob);
  }

  const zipBlob = await zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  downloadBlob(zipBlob, zipFilename);
}

/**
 * Human readable file size formatter.
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
