import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/not-found-error';
import { BadRequestError } from '../errors/bad-request-error';
import { processImage } from '../utils/image-processor';
import {
  createTestStrip,
  findAllTestStrips,
  findTestStripById,
} from '../models/test-strip-model';

export async function uploadTestStrip(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.file) throw new BadRequestError('No image file provided');

  const processingResult = await processImage(req.file.path);

  const submission = await createTestStrip({
    qr_code: processingResult.qrCode?.qrCode,
    original_image_path: req.file.filename,
    thumbnail_path: processingResult.thumbnailPath,
    image_size: processingResult.imageSize,
    image_dimensions: processingResult.imageDimensions,
    status: processingResult.qrCode?.status,
    error_message: processingResult.qrCode?.error,
  });

  res.status(StatusCodes.CREATED).json(submission);
}

export async function getTestStrips(
  req: Request,
  res: Response,
): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const result = await findAllTestStrips({ page, limit, offset });

  res.json(result);
}

export async function getTestStripById(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  if (!id) throw new BadRequestError('id is required');

  const submission = await findTestStripById(id);
  if (!submission) throw new NotFoundError('Test strip not found');

  res.json(submission);
}
