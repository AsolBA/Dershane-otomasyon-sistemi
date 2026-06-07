import { query } from "../../db.js";
import { AppError } from "../../utils/app-error.js";

export async function listExams(filters, pagination) {
  const parts = [`1=1`];
  const params = [];
  let p = 1;
  if (filters.courseId) {
    parts.push(`course_id = $${p++}`);
    params.push(filters.courseId);
  }
  if (filters.classId) {
    parts.push(`class_id = $${p++}`);
    params.push(filters.classId);
  }
  if (filters.fromDate) {
    parts.push(`exam_date >= $${p++}`);
    params.push(filters.fromDate);
  }
  if (filters.toDate) {
    parts.push(`exam_date <= $${p++}`);
    params.push(filters.toDate);
  }
  const whereClause = parts.join(" AND ");

  const count = await query(`SELECT COUNT(*) AS total FROM exams WHERE ${whereClause}`, params);
  const limitIdx = p;
  const offsetIdx = p + 1;
  const listParams = [...params, pagination.limit, pagination.offset];
  const rows = await query(
    `
    SELECT * FROM exams
    WHERE ${whereClause}
    ORDER BY exam_date DESC, id DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    listParams,
  );
  return {
    items: rows.rows,
    total: Number(count.rows[0].total),
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getExamById(id) {
  const r = await query(`SELECT * FROM exams WHERE id = $1`, [id]);
  if (!r.rows[0]) throw new AppError(404, "EXAM_NOT_FOUND", "Sinav bulunamadi.");
  return r.rows[0];
}

export async function createExam(payload) {
  const r = await query(
    `
    INSERT INTO exams (name, exam_date, course_id, class_id, teacher_id, max_score)
    VALUES ($1, $2::date, $3, $4, $5, COALESCE($6, 100))
    RETURNING *`,
    [
      payload.name,
      payload.examDate,
      payload.courseId,
      payload.classId ?? null,
      payload.teacherId ?? null,
      payload.maxScore,
    ],
  );
  return r.rows[0];
}

export async function updateExam(id, payload) {
  await getExamById(id);
  const fields = [];
  const params = [];
  let pi = 1;
  if (payload.name !== undefined) {
    fields.push(`name = $${pi++}`);
    params.push(payload.name);
  }
  if (payload.examDate !== undefined) {
    fields.push(`exam_date = $${pi++}::date`);
    params.push(payload.examDate);
  }
  if (payload.courseId !== undefined) {
    fields.push(`course_id = $${pi++}`);
    params.push(payload.courseId);
  }
  if (payload.classId !== undefined) {
    fields.push(`class_id = $${pi++}`);
    params.push(payload.classId);
  }
  if (payload.teacherId !== undefined) {
    fields.push(`teacher_id = $${pi++}`);
    params.push(payload.teacherId);
  }
  if (payload.maxScore !== undefined) {
    fields.push(`max_score = $${pi++}`);
    params.push(payload.maxScore);
  }
  if (fields.length === 0) return getExamById(id);

  params.push(id);
  const row = await query(`UPDATE exams SET ${fields.join(", ")} WHERE id = $${pi} RETURNING *`, params);
  return row.rows[0];
}

export async function deleteExam(id) {
  const r = await query(`DELETE FROM exams WHERE id = $1 RETURNING id`, [id]);
  if (r.rowCount === 0) throw new AppError(404, "EXAM_NOT_FOUND", "Sinav bulunamadi.");
}

export async function listResults(examId, pagination, options = {}) {
  await getExamById(examId);
  const params = [examId];
  let idx = 2;
  let where = "exam_id = $1";
  if (options.studentId != null) {
    where += ` AND student_id = $${idx++}`;
    params.push(options.studentId);
  }

  const countSql = `SELECT COUNT(*) AS total FROM exam_results WHERE ${where}`;
  const countRes = await query(countSql, params);

  params.push(pagination.limit, pagination.offset);
  const limitIdx = idx;
  const offsetIdx = idx + 1;

  const rows = await query(
    `
    SELECT * FROM exam_results
    WHERE ${where}
    ORDER BY id
    LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params,
  );

  return {
    examId,
    items: rows.rows,
    total: Number(countRes.rows[0].total),
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function upsertResult(payload) {
  const exam = await getExamById(payload.examId);
  const maxScore = Number(exam.max_score);
  if (Number(payload.score) > maxScore + 1e-9) {
    throw new AppError(400, "EXAM_SCORE_ABOVE_MAX", "Puan ust sinirin uzerinde.");
  }

  const r = await query(
    `
      INSERT INTO exam_results (exam_id, student_id, score, note)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (exam_id, student_id)
      DO UPDATE SET score = EXCLUDED.score, note = COALESCE(EXCLUDED.note, exam_results.note)
      RETURNING *`,
    [payload.examId, payload.studentId, payload.score, payload.note ?? null],
  );
  return r.rows[0];
}

export async function updateResult(examResultId, payload) {
  const existing = await getExamResultById(examResultId);
  const exam = await getExamById(existing.exam_id);
  const maxScore = Number(exam.max_score);
  const nextScore = payload.score !== undefined ? Number(payload.score) : Number(existing.score);
  if (nextScore > maxScore + 1e-9) {
    throw new AppError(400, "EXAM_SCORE_ABOVE_MAX", "Puan ust sinirin uzerinde.");
  }

  const fields = [];
  const params = [];
  let pi = 1;
  if (payload.score !== undefined) {
    fields.push(`score = $${pi++}`);
    params.push(payload.score);
  }
  if (payload.note !== undefined) {
    fields.push(`note = $${pi++}`);
    params.push(payload.note);
  }
  if (fields.length === 0) return getExamResultById(examResultId);

  params.push(examResultId);
  const r = await query(`UPDATE exam_results SET ${fields.join(", ")} WHERE id = $${pi} RETURNING *`, params);

  return r.rows[0];
}

export async function getExamResultById(id) {
  const r = await query(`SELECT * FROM exam_results WHERE id = $1`, [id]);
  if (!r.rows[0]) throw new AppError(404, "EXAM_RESULT_NOT_FOUND", "Sinav sonucu bulunamadi.");
  return r.rows[0];
}

export async function deleteResult(id) {
  const r = await query(`DELETE FROM exam_results WHERE id = $1 RETURNING id`, [id]);
  if (r.rowCount === 0) throw new AppError(404, "EXAM_RESULT_NOT_FOUND", "Sinav sonucu bulunamadi.");
}

export async function listExamResultsForStudent(studentId) {
  const r = await query(
    `
    SELECT e.id, e.name, e.exam_date, e.class_id, e.course_id, er.score
    FROM exams e
    JOIN students s ON s.id = $1
    LEFT JOIN exam_results er ON er.exam_id = e.id AND er.student_id = s.id
    WHERE e.class_id = s.current_class_id OR e.class_id IS NULL
    ORDER BY e.exam_date DESC, e.id DESC`,
    [studentId],
  );
  return r.rows;
}
