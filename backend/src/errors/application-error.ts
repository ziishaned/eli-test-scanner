import { StatusCodes } from "http-status-codes";

export class ApplicationError extends Error {
  status: number;

  constructor(message: string, status?: number) {
    super();

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message ?? "Internal server error";
    this.status = status || StatusCodes.INTERNAL_SERVER_ERROR;
  }
}
