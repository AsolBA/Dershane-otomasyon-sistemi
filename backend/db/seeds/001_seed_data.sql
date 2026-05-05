BEGIN;

INSERT INTO roles (name, description)
VALUES
  ('admin', 'Sistem yoneticisi'),
  ('manager', 'Kurum muduru'),
  ('teacher', 'Ogretmen'),
  ('student', 'Ogrenci'),
  ('parent', 'Veli')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash)
SELECT r.id, 'Admin', 'User', 'admin@dershane.local', '5550000000', '$2a$10$9s1QLOvQByDqswCC0fA6xOkqZZ91Ajn8vgbf4OD8UshQQ5mX8n9IS'
FROM roles r
WHERE r.name = 'admin'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash)
SELECT r.id, 'Ayse', 'Yilmaz', 'ayse.teacher@dershane.local', '5551111111', '$2a$10$9s1QLOvQByDqswCC0fA6xOkqZZ91Ajn8vgbf4OD8UshQQ5mX8n9IS'
FROM roles r
WHERE r.name = 'teacher'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash)
SELECT r.id, 'Fatma', 'Kaya', 'fatma.parent@dershane.local', '5552222222', '$2a$10$9s1QLOvQByDqswCC0fA6xOkqZZ91Ajn8vgbf4OD8UshQQ5mX8n9IS'
FROM roles r
WHERE r.name = 'parent'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash)
SELECT r.id, 'Mehmet', 'Demir', 'mehmet.student@dershane.local', '5553333333', '$2a$10$9s1QLOvQByDqswCC0fA6xOkqZZ91Ajn8vgbf4OD8UshQQ5mX8n9IS'
FROM roles r
WHERE r.name = 'student'
ON CONFLICT (email) DO NOTHING;

INSERT INTO teachers (user_id, branch)
SELECT u.id, 'Matematik'
FROM users u
WHERE u.email = 'ayse.teacher@dershane.local'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO parents (user_id, occupation)
SELECT u.id, 'Muhasebeci'
FROM users u
WHERE u.email = 'fatma.parent@dershane.local'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO classes (name, level, advisor_teacher_id)
SELECT '12-A', 12, t.id
FROM teachers t
JOIN users u ON u.id = t.user_id
WHERE u.email = 'ayse.teacher@dershane.local'
ON CONFLICT (name) DO NOTHING;

INSERT INTO students (user_id, student_no, current_class_id, parent_id)
SELECT
  su.id,
  'STD-1001',
  c.id,
  p.id
FROM users su
LEFT JOIN classes c ON c.name = '12-A'
LEFT JOIN parents p ON TRUE
LEFT JOIN users pu ON pu.id = p.user_id
WHERE su.email = 'mehmet.student@dershane.local'
  AND pu.email = 'fatma.parent@dershane.local'
ON CONFLICT (student_no) DO NOTHING;

INSERT INTO courses (name, code, description)
VALUES
  ('Matematik', 'MAT101', 'Temel matematik dersi'),
  ('Fizik', 'FIZ101', 'Temel fizik dersi')
ON CONFLICT (code) DO NOTHING;

INSERT INTO class_students (class_id, student_id)
SELECT c.id, s.id
FROM classes c
JOIN students s ON s.student_no = 'STD-1001'
WHERE c.name = '12-A'
ON CONFLICT (class_id, student_id) DO NOTHING;

INSERT INTO class_courses (class_id, course_id)
SELECT c.id, co.id
FROM classes c
JOIN courses co ON co.code = 'MAT101'
WHERE c.name = '12-A'
ON CONFLICT (class_id, course_id) DO NOTHING;

INSERT INTO teacher_courses (teacher_id, course_id)
SELECT t.id, co.id
FROM teachers t
JOIN users u ON u.id = t.user_id
JOIN courses co ON co.code = 'MAT101'
WHERE u.email = 'ayse.teacher@dershane.local'
ON CONFLICT (teacher_id, course_id) DO NOTHING;

INSERT INTO schedules (class_id, course_id, teacher_id, day_of_week, start_time, end_time, room)
SELECT c.id, co.id, t.id, 1, '09:00', '10:30', 'D-101'
FROM classes c
JOIN courses co ON co.code = 'MAT101'
JOIN teachers t ON TRUE
JOIN users u ON u.id = t.user_id
WHERE c.name = '12-A' AND u.email = 'ayse.teacher@dershane.local'
  AND NOT EXISTS (
    SELECT 1
    FROM schedules s
    WHERE s.class_id = c.id
      AND s.course_id = co.id
      AND s.teacher_id = t.id
      AND s.day_of_week = 1
      AND s.start_time = '09:00'
      AND s.end_time = '10:30'
  );

INSERT INTO exams (name, exam_date, course_id, class_id, teacher_id, max_score)
SELECT 'Matematik Deneme 1', CURRENT_DATE, co.id, c.id, t.id, 100
FROM courses co
JOIN classes c ON c.name = '12-A'
JOIN teachers t ON TRUE
JOIN users u ON u.id = t.user_id
WHERE co.code = 'MAT101' AND u.email = 'ayse.teacher@dershane.local'
  AND NOT EXISTS (
    SELECT 1
    FROM exams e
    WHERE e.name = 'Matematik Deneme 1'
      AND e.exam_date = CURRENT_DATE
      AND e.course_id = co.id
      AND e.class_id = c.id
  );

INSERT INTO exam_results (exam_id, student_id, score, note)
SELECT e.id, s.id, 85, 'Iyi performans'
FROM exams e
JOIN students s ON s.student_no = 'STD-1001'
WHERE e.name = 'Matematik Deneme 1'
ON CONFLICT (exam_id, student_id) DO NOTHING;

INSERT INTO attendance (student_id, schedule_id, attendance_date, status)
SELECT s.id, sc.id, CURRENT_DATE, 'present'
FROM students s
JOIN schedules sc ON TRUE
WHERE s.student_no = 'STD-1001'
LIMIT 1
ON CONFLICT (student_id, schedule_id, attendance_date) DO NOTHING;

INSERT INTO announcements (title, content, target_role_id, created_by)
SELECT
  'Haftalik Program',
  'Yeni haftalik ders programi yayinlandi.',
  r.id,
  u.id
FROM roles r
JOIN users u ON u.email = 'admin@dershane.local'
WHERE r.name = 'student'
  AND NOT EXISTS (
    SELECT 1
    FROM announcements a
    WHERE a.title = 'Haftalik Program'
      AND a.target_role_id = r.id
      AND a.created_by = u.id
  );

INSERT INTO notifications (user_id, announcement_id, title, message)
SELECT
  su.id,
  a.id,
  'Yeni Duyuru',
  'Haftalik program duyurusu eklendi.'
FROM users su
JOIN announcements a ON a.title = 'Haftalik Program'
WHERE su.email = 'mehmet.student@dershane.local'
  AND NOT EXISTS (
    SELECT 1
    FROM notifications n
    WHERE n.user_id = su.id
      AND n.announcement_id = a.id
      AND n.title = 'Yeni Duyuru'
  );

COMMIT;
