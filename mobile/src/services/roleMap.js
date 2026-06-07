const API_TO_UI = {
  admin: "ADMIN",
  manager: "DIRECTOR",
  teacher: "TEACHER",
  student: "STUDENT",
  parent: "PARENT"
};

export function apiRoleToUi(role) {
  if (!role) return role;
  const key = String(role).toLowerCase();
  return API_TO_UI[key] || String(role).toUpperCase();
}
