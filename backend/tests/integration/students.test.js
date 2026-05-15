import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authHeader, getAgent, loginAsAdmin } from "../helpers/http.js";

describe("Students API", () => {
  it("GET /api/students returns paginated list for admin", async () => {
    const agent = getAgent();
    const login = await loginAsAdmin(agent);

    const response = await agent
      .get("/api/students?page=1&limit=10")
      .set(authHeader(login.accessToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(Array.isArray(response.body.data.items));
    assert.ok(response.body.data.total >= 1);
  });

  it("GET /api/students/:id returns seeded student", async () => {
    const agent = getAgent();
    const login = await loginAsAdmin(agent);

    const listResponse = await agent
      .get("/api/students?studentNo=STD-1001")
      .set(authHeader(login.accessToken));

    const studentId = listResponse.body.data.items[0]?.id;
    assert.ok(studentId);

    const response = await agent
      .get(`/api/students/${studentId}`)
      .set(authHeader(login.accessToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.student_no, "STD-1001");
  });

  it("GET /api/students without token returns 401", async () => {
    const agent = getAgent();
    const response = await agent.get("/api/students");

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
  });
});
