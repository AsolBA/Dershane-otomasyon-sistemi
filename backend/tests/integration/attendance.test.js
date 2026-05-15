import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authHeader, getAgent, loginAsAdmin } from "../helpers/http.js";

async function getSeedContext(agent, accessToken) {
  const studentsRes = await agent
    .get("/api/students?studentNo=STD-1001")
    .set(authHeader(accessToken));
  const studentId = studentsRes.body.data.items[0]?.id;

  const schedulesRes = await agent
    .get("/api/schedules?limit=1")
    .set(authHeader(accessToken));
  const scheduleId = schedulesRes.body.data.items[0]?.id;

  const classesRes = await agent.get("/api/classes?limit=1").set(authHeader(accessToken));
  const classId = classesRes.body.data.items[0]?.id;

  return { studentId, scheduleId, classId };
}

describe("Attendance API", () => {
  it("POST /api/attendance/mark upserts attendance", async () => {
    const agent = getAgent();
    const login = await loginAsAdmin(agent);
    const { studentId, scheduleId } = await getSeedContext(agent, login.accessToken);

    assert.ok(studentId);
    assert.ok(scheduleId);

    const today = new Date().toISOString().slice(0, 10);
    const response = await agent
      .post("/api/attendance/mark")
      .set(authHeader(login.accessToken))
      .send({
        studentId,
        scheduleId,
        attendanceDate: today,
        status: "present",
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, "present");
  });

  it("GET /api/attendance/report returns summary", async () => {
    const agent = getAgent();
    const login = await loginAsAdmin(agent);
    const { classId } = await getSeedContext(agent, login.accessToken);

    assert.ok(classId);

    const fromDate = "2020-01-01";
    const toDate = "2099-12-31";

    const response = await agent
      .get(`/api/attendance/report?classId=${classId}&fromDate=${fromDate}&toDate=${toDate}`)
      .set(authHeader(login.accessToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(response.body.data.summary);
    assert.ok(Array.isArray(response.body.data.perStudent));
  });
});
