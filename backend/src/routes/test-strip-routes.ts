import {
  getTestStrips,
  uploadTestStrip,
  getTestStripById,
} from "@/src/controllers/test-strip-controller";
import { Router } from "express";
import { asyncHandler } from "@/src/middleware/error-handler";
import { handleMulterError, uploadSingleImage } from "@/src/middleware/upload";

const router = Router();

router.post(
  "/upload",
  uploadSingleImage,
  handleMulterError,
  asyncHandler(uploadTestStrip)
);
router.get("/", asyncHandler(getTestStrips));
router.get("/:id", asyncHandler(getTestStripById));

export default router;
