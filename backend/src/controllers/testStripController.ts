import { Request, Response } from "express";
import path from "path";
import { TestStripModel } from "../models/TestStripModel";
import { ImageProcessor } from "../utils/imageProcessor";
import { UploadResponse, SubmissionStatus, PaginationParams } from "../types";

export class TestStripController {
  /**
   * POST /api/test-strips/upload
   * Upload and process test strip image
   */
  static async uploadTestStrip(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }

      // Validate file
      const validation = ImageProcessor.validateImageFile(req.file);
      if (!validation.isValid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const imagePath = req.file.path;
      const filename = req.file.filename;

      // Process the image
      const processingResult = await ImageProcessor.processImage(
        imagePath,
        req.file.originalname
      );

      // Determine status based on processing result
      let status: SubmissionStatus = "completed";
      let errorMessage: string | undefined;

      if (processingResult.quality === "failed") {
        status = "failed";
        errorMessage = "Image processing failed";
      } else if (!processingResult.qrCode) {
        status = "qr_not_found";
      } else if (!processingResult.qrCode.isValid) {
        status = "qr_invalid";
      } else if (processingResult.qrCode.isExpired) {
        status = "qr_expired";
      }

      // Save to database
      const submission = await TestStripModel.create({
        qr_code: processingResult.qrCode?.data,
        original_image_path: filename,
        thumbnail_path: processingResult.thumbnailPath,
        image_size: processingResult.imageSize,
        image_dimensions: processingResult.imageDimensions,
        status,
        error_message: errorMessage,
      });

      // Prepare response
      const response: UploadResponse = {
        id: submission.id,
        status: submission.status,
        qr_code: submission.qr_code,
        qr_code_valid: processingResult.qrCode?.isValid,
        quality: processingResult.quality,
        processed_at: submission.created_at,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Upload processing failed:", error);
      res.status(500).json({
        error: "Internal server error during image processing",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  /**
   * GET /api/test-strips
   * Get paginated list of test strip submissions
   */
  static async getTestStrips(req: Request, res: Response): Promise<void> {
    try {
      // Parse pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100 per page
      const offset = (page - 1) * limit;

      const pagination: PaginationParams = { page, limit, offset };

      // Fetch paginated data
      const result = await TestStripModel.findAll(pagination);

      res.json(result);
    } catch (error) {
      console.error("Failed to fetch test strips:", error);
      res.status(500).json({
        error: "Failed to fetch test strips",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  /**
   * GET /api/test-strips/:id
   * Get detailed test strip submission by ID
   */
  static async getTestStripById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({ error: "Invalid ID format" });
        return;
      }

      const submission = await TestStripModel.findById(id);

      if (!submission) {
        res.status(404).json({ error: "Test strip submission not found" });
        return;
      }

      // Enhanced response with additional metadata
      const response = {
        ...submission,
        original_image_url: `/uploads/images/${submission.original_image_path}`,
        thumbnail_url: submission.thumbnail_path
          ? `/uploads/thumbnails/${submission.thumbnail_path}`
          : null,
        quality:
          submission.status === "completed"
            ? "good"
            : submission.status === "failed"
            ? "failed"
            : "poor",
      };

      res.json(response);
    } catch (error) {
      console.error("Failed to fetch test strip:", error);
      res.status(500).json({
        error: "Failed to fetch test strip",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
}
