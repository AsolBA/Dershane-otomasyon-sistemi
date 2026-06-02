export const USE_MOCK_API = String(import.meta.env.VITE_USE_MOCK_API ?? "true") === "true";

export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api").replace(/\/$/, "");
