import request from "supertest";
import { createApp } from "../../src/app.js";

let cachedApp;

export function getAgent() {
  if (!cachedApp) {
    cachedApp = createApp();
  }
  return request(cachedApp);
}

export async function loginAsAdmin(agent = getAgent()) {
  const response = await agent.post("/api/auth/login").send({
    email: "admin@dershane.local",
    password: "Admin123!",
  });

  if (response.status !== 200 || !response.body?.data?.accessToken) {
    throw new Error(`Admin login failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  return response.body.data;
}

export function authHeader(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}
