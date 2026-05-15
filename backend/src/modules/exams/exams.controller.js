import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { parseId, parsePagination } from "../../utils/query-params.js";
import * as svc from "./exams.service.js";
import * as studentsSvc from "../students/students.service.js";


export const listExams = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const filters = {
    courseId: req.query.courseId ? Number(req.query.courseId) : undefined,
    classId: req.query.classId ? Number(req.query.classId) : undefined,
    fromDate: req.query.fromDate,
    toDate: req.query.toDate,
  };
  const data = await svc.listExams(filters, { page, limit, offset });
  return sendSuccess(res, data);
});

export const getExam = asyncHandler(async (req, res) => {
  const id = parseId(req.params.examId, "examId");
  const exam = await svc.getExamById(id);
  return sendSuccess(res, exam);
});

export const createExam = asyncHandler(async (req, res) => {
  const b = req.body ?? {};
  if (!b.name || !b.examDate || !b.courseId) {
    throw new AppError(400, "VALIDATION_ERROR", "name, examDate, courseId zorunludur.");
  }
  const exam = await svc.createExam({
    name: b.name,
    examDate: b.examDate,
    courseId: Number(b.courseId),
    classId: b.classId ?? null,
    teacherId: b.teacherId ?? null,
    maxScore: b.maxScore,
  });
  return sendSuccess(res, exam, "Sinav olusturuldu.", 201);
});

export const updateExam = asyncHandler(async (req, res) => {
  const id = parseId(req.params.examId, "examId");
  const b = req.body ?? {};
  const patch = {};
  if (b.name !== undefined) patch.name = b.name;
  if (b.examDate !== undefined) patch.examDate = b.examDate;
  if (b.courseId !== undefined) patch.courseId = Number(b.courseId);
  if (b.classId !== undefined) patch.classId = b.classId;
  if (b.teacherId !== undefined) patch.teacherId = b.teacherId;
  if (b.maxScore !== undefined) patch.maxScore = b.maxScore;
  const exam = await svc.updateExam(id, patch);
  return sendSuccess(res, exam, "Sinav guncellendi.");
});

export const deleteExam = asyncHandler(async (req, res) => {
  const id = parseId(req.params.examId, "examId");
  await svc.deleteExam(id);
  return sendSuccess(res, { deleted: true }, "Sinav silindi.");
});

export const listResults = asyncHandler(async (req, res) => {
  const examId = parseId(req.params.examId, "examId");
  const { page, limit, offset } = parsePagination(req.query);

  let options = {};
  if (req.user.role === "student") {
    const sid = await studentsSvc.getStudentIdByUserId(req.user.id);
    if (!sid) {
      return sendSuccess(res, {
        examId,
        items: [],
        total: 0,
        page,
        limit,
      });
    }
    options = { studentId: sid };
  }

  const data = await svc.listResults(examId, { page, limit, offset }, options);

  return sendSuccess(res, data);
});

export const upsertResult = asyncHandler(async (req, res) => {
  const examId = parseId(req.params.examId, "examId");
  const b = req.body ?? {};
  if (!b.studentId || b.score === undefined || b.score === null) {
    throw new AppError(400, "VALIDATION_ERROR", "studentId ve score zorunludur.");
  }

  const row = await svc.upsertResult({
    examId,
    studentId: Number(b.studentId),
    score: Number(b.score),
    note: b.note,
  });
  return sendSuccess(res, row, "Sinav sonucu kaydedildi.", 201);
});

export const updateResult = asyncHandler(async (req, res) => {
  const examResultId = parseId(req.params.resultId);
  const row = await svc.updateResult(examResultId, req.body ?? {});
  return sendSuccess(res, row, "Sonuc guncellendi.");
});

export const deleteResult = asyncHandler(async (req, res) => {
  const examResultId = parseId(req.params.resultId);
  await svc.deleteResult(examResultId);
  return sendSuccess(res, { deleted: true }, "Sinav sonucu silindi.");
});
