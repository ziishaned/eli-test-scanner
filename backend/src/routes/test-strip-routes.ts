import { Router } from "express";
import { uploadSingleImage } from "../middleware/upload";
import { asyncHandler } from "../middleware/error-handler";
import { TestStripController } from "../controllers/test-strip-controller";
import { Request, Response, NextFunction } from "express";

const router = Router();

// Multer error handler middleware
const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    err &&
    (err.name === "MulterError" || err.message.includes("Invalid file type"))
  ) {
    return res.status(400).json({
      error: err.message,
    });
  }
  next(err);
};

// POST /api/test-strips/upload
router.post(
  "/upload",
  uploadSingleImage,
  handleMulterError,
  asyncHandler(TestStripController.uploadTestStrip)
);

// GET /api/test-strips
router.get("/", asyncHandler(TestStripController.getTestStrips));

// GET /api/test-strips/:id
router.get("/:id", asyncHandler(TestStripController.getTestStripById));

export default router;
