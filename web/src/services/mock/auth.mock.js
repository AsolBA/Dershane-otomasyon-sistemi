import { writeStoredSession, readStoredSession } from "../../auth/storage.js";
import { apiRoleToUi } from "../roleMap.js";
import { DEFAULT_USER_PASSWORD } from "../../utils/passwordPolicy.js";

const profiles = {
  ADMIN: {
    id: "usr_admin",
    name: "Sistem Yöneticisi",
    email: "admin@dershane.local"
  },
  DIRECTOR: {
    id: "usr_director",
    name: "Kurum Müdürü",
    email: "mudur@dershane.local"
  },
  TEACHER: {
    id: "tch_1",
    name: "Burak Polat",
    email: "burak@teacher.local"
  },
  STUDENT: {
    id: "usr_stu_1",
    studentId: "stu_1",
    name: "Ayşe Yılmaz",
    email: "ayse@student.local",
    className: "12-A"
  },
  PARENT: {
    id: "parent_1",
    name: "Mehmet Yılmaz",
    email: "veli@parent.local",
    linkedStudentId: "stu_1"
  }
};

export async function login({ email, password, role }) {
  const safeRole = apiRoleToUi(role || "TEACHER");
  const profile = profiles[safeRole] || profiles.TEACHER;
  const safeEmail = email?.trim() || profile.email;

  const accessToken = `mock_access_${safeRole.toLowerCase()}`;
  const refreshToken = `mock_refresh_${safeRole.toLowerCase()}`;

  const user = {
    ...profile,
    email: safeEmail,
    role: safeRole,
    mustChangePassword: password === DEFAULT_USER_PASSWORD
  };

  writeStoredSession({ accessToken, refreshToken, user });
  return { accessToken, refreshToken, user };
}

export async function logout() {
  return { ok: true };
}

export async function forgotPassword() {
  return { submitted: true };
}

export async function changePassword({ currentPassword, newPassword }) {
  const session = readStoredSession();
  const user = { ...session.user, mustChangePassword: false };
  writeStoredSession({ ...session, user });
  return { user };
}
