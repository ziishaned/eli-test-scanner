import { Router } from "express";
import { uploadSingleImage } from "../middleware/upload";
import { asyncHandler } from "../middleware/error-handler";
import { TestStripController } from "../controllers/test-strip-controller";

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
