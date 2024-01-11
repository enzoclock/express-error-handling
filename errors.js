export class HttpClientError extends Error {
  name;
  statusCode;

  constructor(message, { statusCode }) {
    super(message);
    
    // Platform specific error fields
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    // Capture stack trace for debugging purposes
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends HttpClientError {
  constructor(message) {
    super(message, { statusCode: 400 });
  }
}

export class NotFoundError extends HttpClientError {
  constructor(message) {
    super(message, { statusCode: 404 });
  }
}
