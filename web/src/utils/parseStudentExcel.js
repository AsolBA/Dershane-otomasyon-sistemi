import * as XLSX from "xlsx";
import { buildParentLoginEmail, buildStudentLoginEmail } from "./email.js";

const FIELD_ALIASES = {
  firstName: ["ogrenci ad", "ad", "first name", "firstname", "isim"],
  lastName: ["ogrenci soyad", "soyad", "last name", "lastname"],
  className: ["sinif", "sınıf", "class", "sube", "şube"],
  parentName: ["veli ad soyad", "veli adi", "veli adı", "veli ad", "parent name"],
  parentPhone: ["veli telefon", "veli tel", "veli telefonu", "parent phone", "telefon"]
};

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findColumnIndex(headers, field) {
  const aliases = FIELD_ALIASES[field];
  for (let i = 0; i < headers.length; i++) {
    const h = normalizeHeader(headers[i]);
    if (aliases.includes(h)) return i;
  }
  return -1;
}

function cellValue(row, index) {
  if (index < 0) return "";
  const raw = row[index];
  if (raw == null) return "";
  return String(raw).trim();
}

export async function parseStudentExcelFile(file, { knownClasses = [] } = {}) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Excel dosyasında sayfa bulunamadı.");

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (!matrix.length) throw new Error("Excel dosyası boş.");

  const headerRowIdx = matrix.findIndex((row) => row.some((cell) => String(cell).trim()));
  if (headerRowIdx < 0) throw new Error("Başlık satırı bulunamadı.");

  const headers = matrix[headerRowIdx];
  const cols = {
    firstName: findColumnIndex(headers, "firstName"),
    lastName: findColumnIndex(headers, "lastName"),
    className: findColumnIndex(headers, "className"),
    parentName: findColumnIndex(headers, "parentName"),
    parentPhone: findColumnIndex(headers, "parentPhone")
  };

  const missingLabels = [];
  if (cols.firstName < 0) missingLabels.push("Öğrenci Ad");
  if (cols.lastName < 0) missingLabels.push("Öğrenci Soyad");
  if (cols.className < 0) missingLabels.push("Sınıf");
  if (cols.parentName < 0) missingLabels.push("Veli Ad Soyad");
  if (cols.parentPhone < 0) missingLabels.push("Veli Telefon");
  if (missingLabels.length) {
    throw new Error(`Excel başlıkları eksik: ${missingLabels.join(", ")}`);
  }

  const classSet = new Set(knownClasses.map((c) => String(c).trim().toLowerCase()));
  const rows = [];

  for (let r = headerRowIdx + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || !row.some((cell) => String(cell).trim())) continue;

    const firstName = cellValue(row, cols.firstName);
    const lastName = cellValue(row, cols.lastName);
    const className = cellValue(row, cols.className);
    const parentName = cellValue(row, cols.parentName);
    const parentPhone = cellValue(row, cols.parentPhone);

    const errors = [];
    if (!firstName) errors.push("Öğrenci adı boş.");
    if (!lastName) errors.push("Öğrenci soyadı boş.");
    if (!className) errors.push("Sınıf boş.");
    else if (classSet.size && !classSet.has(className.toLowerCase())) {
      errors.push(`Sınıf bulunamadı: ${className}`);
    }
    if (!parentName) errors.push("Veli adı boş.");
    if (!parentPhone) errors.push("Veli telefonu boş.");

    const studentEmail = buildStudentLoginEmail(firstName, lastName);
    const parentEmail = buildParentLoginEmail(firstName, lastName);
    if (!studentEmail || !parentEmail) errors.push("E-posta üretilemedi.");

    rows.push({
      rowNumber: r + 1,
      firstName,
      lastName,
      className,
      parentName,
      parentPhone,
      studentEmail,
      parentEmail,
      errors,
      valid: errors.length === 0
    });
  }

  if (!rows.length) throw new Error("İçe aktarılacak öğrenci satırı bulunamadı.");
  return rows;
}
