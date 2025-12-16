export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
    public stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(401, message);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(403, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, message);
  }
}
