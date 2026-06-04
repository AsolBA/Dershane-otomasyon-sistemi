// =============================================================================
// utils/api-response.js — Standart API cevap formati
// Tum endpoint'ler { success, data, message } veya hata icin { success, error } doner.
// Frontend ve mobil bu yapıyı bekler.
// =============================================================================
export function sendSuccess(res, data, message, statusCode = 200) {
  const payload = {
    success: true,
    data,
  };

  if (message) {
    payload.message = message;
  }

  return res.status(statusCode).json(payload);
}

export function sendError(res, statusCode, code, details, message) {
  const payload = {
    success: false,
    data: null,
    error: {
      code,
      details,
    },
  };

  if (message) {
    payload.message = message;
  }

  return res.status(statusCode).json(payload);
}
