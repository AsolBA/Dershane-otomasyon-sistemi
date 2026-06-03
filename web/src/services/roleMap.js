const API_TO_UI = {
  admin: "ADMIN",
  manager: "DIRECTOR",
  teacher: "TEACHER",
  student: "STUDENT",
  parent: "PARENT"
};

const UI_TO_API = Object.fromEntries(Object.entries(API_TO_UI).map(([k, v]) => [v, k]));

export function apiRoleToUi(role) {
  if (!role) return role;
  const key = String(role).toLowerCase();
  return API_TO_UI[key] || String(role).toUpperCase();
}

export function uiRoleToApi(role) {
  if (!role) return role;
  return UI_TO_API[String(role).toUpperCase()] || String(role).toLowerCase();
}
