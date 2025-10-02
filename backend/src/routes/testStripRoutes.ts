import { Router } from "express";
import { TestStripController } from "../controllers/testStripController";
import { uploadSingleImage } from "../middleware/upload";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// POST /api/test-strips/upload
router.post(
  "/upload",
  uploadSingleImage,
  asyncHandler(TestStripController.uploadTestStrip)
);

// GET /api/test-strips
router.get("/", asyncHandler(TestStripController.getTestStrips));

// GET /api/test-strips/:id
router.get("/:id", asyncHandler(TestStripController.getTestStripById));

export default router;
