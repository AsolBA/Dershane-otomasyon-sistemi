import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authHeader, getAgent, loginAsAdmin } from "../helpers/http.js";

describe("Auth API", () => {
  it("POST /api/auth/login returns access and refresh token", async () => {
    const agent = getAgent();
    const response = await agent.post("/api/auth/login").send({
      email: "admin@dershane.local",
      password: "Admin123!",
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(response.body.data.accessToken);
    assert.ok(response.body.data.refreshToken);
  });

  it("GET /api/me works with bearer token", async () => {
    const agent = getAgent();
    const login = await loginAsAdmin(agent);

    const response = await agent.get("/api/me").set(authHeader(login.accessToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.user.email, "admin@dershane.local");
  });

  it("POST /api/auth/refresh rotates refresh token", async () => {
    const agent = getAgent();
    const login = await loginAsAdmin(agent);

    const response = await agent.post("/api/auth/refresh").send({
      refreshToken: login.refreshToken,
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(response.body.data.accessToken);
    assert.ok(response.body.data.refreshToken);
  });

  it("POST /api/auth/login rejects invalid credentials", async () => {
    const agent = getAgent();
    const response = await agent.post("/api/auth/login").send({
      email: "admin@dershane.local",
      password: "wrong-password",
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, "AUTH_INVALID_CREDENTIALS");
  });
});
