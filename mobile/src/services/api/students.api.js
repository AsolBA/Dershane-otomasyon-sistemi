import { apiRequest } from "../httpClient";
import * as classesApi from "./classes.api";

function buildClassNameMap(classes) {
  const map = new Map();
  for (const c of classes) {
    const id = c.id ?? c.class_id;
    const name = c.name ?? c.class_name;
    if (id != null && name) map.set(Number(id), name);
  }
  return map;
}

function mapApiStudentToUi(row, classNameById) {
  if (!row) return row;
  const firstName = row.first_name ?? row.firstName ?? "";
  const lastName = row.last_name ?? row.lastName ?? "";
  const classId = row.current_class_id ?? row.currentClassId;
  return {
    id: String(row.id),
    fullName: [firstName, lastName].filter((p) => p && p !== "-").join(" ").trim() || firstName || lastName,
    className: classId != null ? classNameById.get(Number(classId)) ?? "" : ""
  };
}

async function loadClassNameMap() {
  const classes = await classesApi.list({});
  return buildClassNameMap(classes);
}

export async function getById(id) {
  const classNameById = await loadClassNameMap();
  const row = await apiRequest(`/students/${id}`);
  return mapApiStudentToUi(row, classNameById);
}
