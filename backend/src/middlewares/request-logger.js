export function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`;
    console.log(line);
  });

  next();
}
