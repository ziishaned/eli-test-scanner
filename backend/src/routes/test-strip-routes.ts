import {
  getTestStrips,
  uploadTestStrip,
  getTestStripById,
} from "../controllers/test-strip-controller";
import { Router } from "express";
import { asyncHandler } from "../middleware/error-handler";
import { handleMulterError, uploadSingleImage } from "../middleware/upload";

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
