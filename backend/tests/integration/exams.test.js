import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authHeader, getAgent, loginAsAdmin } from "../helpers/http.js";

describe("Exams API", () => {
  it("GET /api/exams returns exam list", async () => {
    const agent = getAgent();
    const login = await loginAsAdmin(agent);

    const response = await agent.get("/api/exams").set(authHeader(login.accessToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(Array.isArray(response.body.data.items));
  });

  it("GET /api/exams/:examId/results returns results for seeded exam", async () => {
    const agent = getAgent();
    const login = await loginAsAdmin(agent);

    const examsResponse = await agent.get("/api/exams").set(authHeader(login.accessToken));
    const examId = examsResponse.body.data.items[0]?.id;
    assert.ok(examId);

    const response = await agent
      .get(`/api/exams/${examId}/results`)
      .set(authHeader(login.accessToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(Array.isArray(response.body.data.items));
  });

  it("POST /api/exams creates exam and result", async () => {
    const agent = getAgent();
    const login = await loginAsAdmin(agent);

    const coursesRes = await agent.get("/api/courses?limit=1").set(authHeader(login.accessToken));
    const courseId = coursesRes.body.data.items[0]?.id;

    const studentsRes = await agent
      .get("/api/students?studentNo=STD-1001")
      .set(authHeader(login.accessToken));
    const studentId = studentsRes.body.data.items[0]?.id;

    assert.ok(courseId);
    assert.ok(studentId);

    const examDate = new Date().toISOString().slice(0, 10);
    const createExamRes = await agent
      .post("/api/exams")
      .set(authHeader(login.accessToken))
      .send({
        name: `Integration Exam ${Date.now()}`,
        examDate,
        courseId,
        maxScore: 100,
      });

    assert.equal(createExamRes.status, 201);
    const examId = createExamRes.body.data.id;

    const resultRes = await agent
      .post(`/api/exams/${examId}/results`)
      .set(authHeader(login.accessToken))
      .send({
        studentId,
        score: 77,
      });

    assert.equal(resultRes.status, 201);
    assert.equal(resultRes.body.success, true);
    assert.equal(Number(resultRes.body.data.score), 77);
  });
});
