import {
  getTestStrips,
  uploadTestStrip,
  getTestStripById,
} from "../controllers/test-strip-controller";
import { Router } from "express";
import { handleMulterError, uploadSingleImage } from "../middleware/upload";

const router = Router();

router.get("/", getTestStrips);
router.get("/:id", getTestStripById);
router.post("/upload", uploadSingleImage, handleMulterError, uploadTestStrip);

export default router;
