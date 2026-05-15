import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAgent } from "../helpers/http.js";

describe("Health API", () => {
  it("GET /health returns ok with db connected", async () => {
    const agent = getAgent();
    const response = await agent.get("/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, "ok");
    assert.equal(response.body.data.db, "connected");
  });

  it("GET /api/unknown returns 404 with standard format", async () => {
    const agent = getAgent();
    const response = await agent.get("/api/unknown-route-for-test");

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, "ROUTE_NOT_FOUND");
  });
});
