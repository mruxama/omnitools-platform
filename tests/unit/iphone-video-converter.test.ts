import { describe, it, expect } from "vitest";
import { inspectVideoFile } from "@/lib/video-converter/videoAnalyzer";
import { losslessRemuxMovToMp4 } from "@/lib/video-converter/converterEngine";

describe("Bulk iPhone Video Converter Engine", () => {
  it("detects MP4/MOV container and parses ISO box brands", async () => {
    // Construct a synthetic QuickTime MOV byte buffer with 'ftyp' and 'qt  '
    const header = new Uint8Array([
      0x00, 0x00, 0x00, 0x14, // size 20
      0x66, 0x74, 0x79, 0x70, // 'ftyp'
      0x71, 0x74, 0x20, 0x20, // 'qt  '
      0x20, 0x05, 0x03, 0x00, // minor version
      0x71, 0x74, 0x20, 0x20, // compatible brand 'qt  '
      // Simulated video track marker 'hvc1' (HEVC)
      0x68, 0x76, 0x63, 0x31,
      // Simulated audio track marker 'mp4a' (AAC)
      0x6d, 0x70, 0x34, 0x61,
    ]);

    const fakeFile = new File([header], "IMG_4920.MOV", { type: "video/quicktime" });
    const analysis = await inspectVideoFile(fakeFile);

    expect(analysis.filename).toBe("IMG_4920.MOV");
    expect(analysis.container).toBe("mov");
    expect(analysis.videoCodec).toBe("hevc");
    expect(analysis.audioCodec).toBe("aac");
    expect(analysis.canRemuxToMp4).toBe(true);
    expect(analysis.recommendedMode).toBe("remux");
  });

  it("identifies ProRes codecs as requiring transcoding for standard MP4", async () => {
    const header = new Uint8Array([
      0x00, 0x00, 0x00, 0x14,
      0x66, 0x74, 0x79, 0x70,
      0x71, 0x74, 0x20, 0x20,
      0x61, 0x70, 0x63, 0x68, // 'apch' (Apple ProRes 422 HQ)
    ]);

    const fakeFile = new File([header], "RAW_CLIP.MOV", { type: "video/quicktime" });
    const analysis = await inspectVideoFile(fakeFile);

    expect(analysis.videoCodec).toBe("prores");
    expect(analysis.canRemuxToMp4).toBe(false);
    expect(analysis.recommendedMode).toBe("transcode");
  });

  it("performs instantaneous stream-copy remuxing into MP4 container", async () => {
    const rawMovData = new Uint8Array([
      0x00, 0x00, 0x00, 0x14,
      0x66, 0x74, 0x79, 0x70,
      0x71, 0x74, 0x20, 0x20,
      0x20, 0x05, 0x03, 0x00,
      0x71, 0x74, 0x20, 0x20,
      // Dummy payload bytes
      0x10, 0x20, 0x30, 0x40,
    ]);

    const testFile = new File([rawMovData], "IMG_0001.MOV", { type: "video/quicktime" });
    const result = await losslessRemuxMovToMp4(testFile, "IMG_0001_converted.mp4");

    expect(result.usedRemux).toBe(true);
    expect(result.outputName).toBe("IMG_0001_converted.mp4");
    expect(result.format).toBe("mp4");
    expect(result.blob.type).toBe("video/mp4");
    expect(result.size).toBeGreaterThan(0);

    // Verify resulting blob header begins with standard mp42 ftyp
    const outBuf = await result.blob.arrayBuffer();
    const outBytes = new Uint8Array(outBuf);
    const boxType = String.fromCharCode(outBytes[4], outBytes[5], outBytes[6], outBytes[7]);
    const majorBrand = String.fromCharCode(outBytes[8], outBytes[9], outBytes[10], outBytes[11]);

    expect(boxType).toBe("ftyp");
    expect(majorBrand).toBe("mp42");
  });
});
