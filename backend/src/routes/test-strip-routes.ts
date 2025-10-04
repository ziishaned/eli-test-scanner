import {
  getTestStrips,
  uploadTestStrip,
  getTestStripById,
} from "../controllers/test-strip-controller";
import { Router } from "express";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getTestStrips);
router.get("/:id", getTestStripById);
router.post("/upload", upload.single("image"), uploadTestStrip);

export default router;
