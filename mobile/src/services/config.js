export const USE_MOCK_API = String(process.env.EXPO_PUBLIC_USE_MOCK_API ?? "true") === "true";

export const API_BASE_URL = String(process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api").replace(
  /\/$/,
  ""
);
