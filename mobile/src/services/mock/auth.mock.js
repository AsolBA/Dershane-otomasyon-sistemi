import { writeStoredSession } from "../../auth/storage";

export async function login({ email, password, role }) {
  const safeEmail = email?.trim() || "student@dershane.local";
  const safeRole = role === "PARENT" ? "PARENT" : "STUDENT";

  const accessToken = `mock_access_${safeRole.toLowerCase()}`;
  const refreshToken = `mock_refresh_${safeRole.toLowerCase()}`;

  const user = {
    id: safeRole === "PARENT" ? "parent_1" : "stu_1",
    email: safeEmail,
    name: safeRole === "PARENT" ? "Veli Kullanici" : "Ayse Yilmaz",
    role: safeRole,
    className: "12-A",
    linkedStudentId: "stu_1"
  };

  await writeStoredSession({ accessToken, refreshToken, user });
  return { accessToken, refreshToken, user };
}

export async function logout() {
  return { ok: true };
}
