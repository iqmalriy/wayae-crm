export class MediaConfigError extends Error {
  constructor(message: string) {
    super(`Media configuration error: ${message}`);
    this.name = "MediaConfigError";
  }
}