import path from "path";
import fs from "fs/promises";
import { ImageProcessingResult } from "../src/types";
import { processImage } from "../src/utils/image-processor";

describe("Test Strip Processing", () => {
  it("should extract QR code from valid image", async () => {
    const result = await processImage(
      path.resolve(__dirname, "./files/test-strip-valid-1.png")
    );
    expect(result.qrCode?.qrCode).toBe("ELI-2025-001");
    expect(result.qrCode?.status).toBe("valid");
  });

  it("should extract QR code from valid image 2", async () => {
    const result = await processImage(
      path.resolve(__dirname, "./files/test-strip-valid-2.png")
    );
    expect(result.qrCode?.qrCode).toBe("ELI-2025-002");
    expect(result.qrCode?.status).toBe("valid");
  });

  it("should reject expired test strips", async () => {
    const result = await processImage(
      path.resolve(__dirname, "./files/test-strip-expired.png")
    );
    expect(result.qrCode?.status).toBe("expired");
    expect(result.qrCode?.error).toContain("Test strip expired");
  });

  it("should handle images with no QR code", async () => {
    const result = await processImage(
      path.resolve(__dirname, "./files/test-strip-no-qr.png")
    );
    expect(result.qrCode?.qrCode).toBeUndefined();
    expect(result.qrCode?.error).toBe("QR code not found");
  });
});
