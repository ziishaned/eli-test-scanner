import { StatusCodes } from 'http-status-codes';
import { ApplicationError } from './application-error';

export class BadRequestError extends ApplicationError {
  constructor(message?: string) {
    super(message ?? 'Bad request error', StatusCodes.BAD_REQUEST);
  }
}
