export class HttpError extends Error {
  status?: number | null;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status ?? null;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}