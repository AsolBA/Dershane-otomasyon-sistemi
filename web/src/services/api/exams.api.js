import { apiRequest } from "../httpClient.js";

function unwrapList(data) {
  return data?.items ?? data?.rows ?? data ?? [];
}

export async function listExams({ q } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  const data = await apiRequest(`/exams?${params.toString()}`);
  return unwrapList(data);
}

export async function createExam(payload) {
  return apiRequest("/exams", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateExam(id, payload) {
  return apiRequest(`/exams/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function removeExam(id) {
  return apiRequest(`/exams/${id}`, { method: "DELETE" });
}

export async function listResults(examId) {
  const data = await apiRequest(`/exams/${examId}/results`);
  return unwrapList(data);
}

export async function upsertResult(examId, studentId, score) {
  return apiRequest(`/exams/${examId}/results`, {
    method: "POST",
    body: JSON.stringify({ studentId, score })
  });
}
