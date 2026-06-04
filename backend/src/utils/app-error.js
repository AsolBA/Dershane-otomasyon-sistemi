// =============================================================================
// utils/app-error.js — Is mantigi hatalari
// Service/controller katmaninda throw new AppError(400, 'KOD', 'mesaj') ile
// HTTP status + hata kodu error-handler'a iletilir.
// =============================================================================
export class AppError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
