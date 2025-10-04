import { Router } from "express";
import { testStripImageUpload } from "../middleware/test-strip-image-upload";
import {
  getTestStrips,
  uploadTestStrip,
  getTestStripById,
} from "../controllers/test-strip-controller";

const router = Router();

router.get("/", getTestStrips);
router.get("/:id", getTestStripById);
router.post("/upload", testStripImageUpload.single("image"), uploadTestStrip);

export default router;
