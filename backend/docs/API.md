# Backend API Ozeti
#
# Bu dosya tum REST endpoint listesidir.
# Web ve mobil ekipleri entegrasyonda bu dokumana gore baglandi.
# Base URL: http://localhost:4000 — Auth disi isteklerde: Authorization: Bearer <token>
#

Base URL: `http://localhost:4000`

Tum endpointler (auth haric) icin header:

```http
Authorization: Bearer <accessToken>
```

Standart response:

```json
{
  "success": true,
  "data": {},
  "message": "Opsiyonel mesaj"
}
```

Hata response:

```json
{
  "success": false,
  "data": null,
  "error": { "code": "ERROR_CODE", "details": null },
  "message": "Aciklama"
}
```

## Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | Hayir |

Ornek:

```http
GET /health
```

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "db": "connected",
    "uptimeSeconds": 120,
    "timestamp": "2026-05-07T12:00:00.000Z"
  },
  "message": "Backend is running"
}
```

## Auth

| Method | Path |
|--------|------|
| POST | `/api/auth/login` |
| POST | `/api/auth/refresh` |
| POST | `/api/auth/logout` |
| GET | `/api/me` |

Login ornek:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dershane.local",
  "password": "Admin123!"
}
```

## Users

| Method | Path | Roller |
|--------|------|--------|
| GET | `/api/users` | admin, manager |
| GET | `/api/users/:id` | admin, manager, self |
| POST | `/api/users` | admin, manager |
| PATCH | `/api/users/:id` | admin, manager |
| DELETE | `/api/users/:id` | admin, manager |

## Students

| Method | Path |
|--------|------|
| GET | `/api/students?classId=&search=&page=&limit=` |
| GET | `/api/students/:id` |
| POST | `/api/students` |
| PATCH | `/api/students/:id` |
| POST | `/api/students/:id/classes` |
| DELETE | `/api/students/:id/classes/:classId` |

## Teachers / Classes / Courses

- `/api/teachers`
- `/api/classes`
- `/api/courses`

CRUD + iliski endpointleri modul route dosyalarinda tanimlidir.

## Schedules

| Method | Path |
|--------|------|
| GET | `/api/schedules` |
| POST | `/api/schedules/conflict-check` |
| POST | `/api/schedules` |
| PATCH | `/api/schedules/:id` |
| DELETE | `/api/schedules/:id` |

Conflict-check body:

```json
{
  "classId": 1,
  "courseId": 1,
  "teacherId": 1,
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "10:30"
}
```

## Attendance

| Method | Path |
|--------|------|
| GET | `/api/attendance` |
| GET | `/api/attendance/report?classId=&fromDate=&toDate=` |
| POST | `/api/attendance/mark` |
| PATCH | `/api/attendance/:id` |

Mark body:

```json
{
  "studentId": 1,
  "scheduleId": 1,
  "attendanceDate": "2026-05-07",
  "status": "present"
}
```

## Exams

| Method | Path |
|--------|------|
| GET | `/api/exams` |
| POST | `/api/exams` |
| GET | `/api/exams/:examId/results` |
| POST | `/api/exams/:examId/results` |

## Announcements / Notifications

- `/api/announcements`
- `/api/notifications/me`
- `PATCH /api/notifications/:id/read`
