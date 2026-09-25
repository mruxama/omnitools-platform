/**
 * Adobe Photoshop PSD Composite Layer Decoder
 * Reads the 8BPS file structure and extracts the composite image layer onto Canvas
 */
export async function parsePsdToCanvas(file: File): Promise<HTMLCanvasElement> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // 1. Signature '8BPS'
  const sig = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (sig !== "8BPS") {
    throw new Error("Invalid Photoshop document: 8BPS header signature missing.");
  }

  const channels = view.getUint16(12, false);
  const height = view.getUint32(14, false);
  const width = view.getUint32(18, false);
  const depth = view.getUint16(22, false);
  const colorMode = view.getUint16(24, false); // 3 = RGB

  if (width === 0 || height === 0) {
    throw new Error("Invalid PSD dimensions: 0x0.");
  }

  // Skip Color Mode Data
  let offset = 26;
  const colorModeDataLen = view.getUint32(offset, false);
  offset += 4 + colorModeDataLen;

  // Skip Image Resources
  const imgResLen = view.getUint32(offset, false);
  offset += 4 + imgResLen;

  // Skip Layer and Mask Data
  const layerMaskLen = view.getUint32(offset, false);
  offset += 4 + layerMaskLen;

  // Image Data Section
  if (offset + 2 > buffer.byteLength) {
    throw new Error("PSD truncated: missing Image Data section.");
  }

  const compression = view.getUint16(offset, false);
  offset += 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas 2D context.");

  const imgData = ctx.createImageData(width, height);
  const pixelCount = width * height;

  if (compression === 0) {
    // Uncompressed planar data: RRR... GGG... BBB... (and optional AAA...)
    const rOffset = offset;
    const gOffset = offset + pixelCount;
    const bOffset = offset + pixelCount * 2;
    const aOffset = channels > 3 ? offset + pixelCount * 3 : -1;

    for (let i = 0; i < pixelCount; i++) {
      const pxIndex = i * 4;
      imgData.data[pxIndex] = bytes[rOffset + i] || 0; // Red
      imgData.data[pxIndex + 1] = bytes[gOffset + i] || 0; // Green
      imgData.data[pxIndex + 2] = bytes[bOffset + i] || 0; // Blue
      imgData.data[pxIndex + 3] = aOffset !== -1 ? bytes[aOffset + i] : 255; // Alpha
    }
  } else if (compression === 1) {
    // PackBits / RLE compression
    // In PackBits, byte counts for each scanline are stored first:
    const scanlineCount = height * channels;
    let rleOffset = offset + scanlineCount * 2; // skip scanline byte counts table

    // Decode channels into temporary arrays
    const decodedChannels: Uint8Array[] = [];
    for (let c = 0; c < Math.min(channels, 4); c++) {
      const channelData = new Uint8Array(pixelCount);
      let written = 0;

      while (written < pixelCount && rleOffset < bytes.length) {
        const header = bytes[rleOffset++];
        if (header < 128) {
          // Literal run: copy header + 1 bytes
          const count = header + 1;
          for (let k = 0; k < count && written < pixelCount; k++) {
            channelData[written++] = bytes[rleOffset++];
          }
        } else if (header > 128) {
          // Repeated run: repeat next byte (257 - header) times
          const count = 256 - header + 1;
          const val = bytes[rleOffset++];
          for (let k = 0; k < count && written < pixelCount; k++) {
            channelData[written++] = val;
          }
        }
        // header === 128 is a no-op
      }
      decodedChannels.push(channelData);
    }

    // Assemble decoded channels into RGBA ImageData
    const rData = decodedChannels[0] || new Uint8Array(pixelCount);
    const gData = decodedChannels[1] || rData;
    const bData = decodedChannels[2] || rData;
    const aData = decodedChannels[3];

    for (let i = 0; i < pixelCount; i++) {
      const pxIndex = i * 4;
      imgData.data[pxIndex] = rData[i];
      imgData.data[pxIndex + 1] = gData[i];
      imgData.data[pxIndex + 2] = bData[i];
      imgData.data[pxIndex + 3] = aData ? aData[i] : 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}
