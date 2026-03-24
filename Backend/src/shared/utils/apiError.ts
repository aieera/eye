export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: any[];
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, errors?: any[]) {
    return new AppError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(403, message);
  }

  static notFound(message = 'Not found') {
    return new AppError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new AppError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new AppError(500, message);
  }
}
