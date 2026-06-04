// async-handler.js — Async route hatalarini error-handler'a yonlendirir (try/catch sarmalayici)
export function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
