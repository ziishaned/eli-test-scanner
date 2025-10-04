import { StatusCodes } from 'http-status-codes';
import { ApplicationError } from './application-error';

export class NotFoundError extends ApplicationError {
  constructor(message?: string) {
    super(message ?? 'Not found error', StatusCodes.NOT_FOUND);
  }
}
