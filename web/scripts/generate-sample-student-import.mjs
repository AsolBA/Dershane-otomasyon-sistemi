import * as XLSX from "xlsx";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public");
const outPath = join(outDir, "ornek-ogrenci-ice-aktar.xlsx");

const studentsByClass = {
  "12-A": [
    ["Uğuralp", "Kıvanç", "Mehmet Kıvanç", "5551001001"],
    ["Zeynep", "Arslan", "Ayşe Arslan", "5551001002"],
    ["Can", "Yıldız", "Hakan Yıldız", "5551001003"],
    ["Elif", "Koç", "Fatma Koç", "5551001004"],
    ["Burak", "Şahin", "Murat Şahin", "5551001005"],
    ["Selin", "Aydın", "Emine Aydın", "5551001006"],
    ["Kerem", "Polat", "Serkan Polat", "5551001007"],
    ["Deniz", "Çelik", "Gül Çelik", "5551001008"],
    ["Mert", "Kara", "Ali Kara", "5551001009"],
    ["Ece", "Öztürk", "Zehra Öztürk", "5551001010"]
  ],
  "12-B": [
    ["Emirhan", "Demir", "Fatma Demir", "5552002001"],
    ["Aylin", "Yılmaz", "Hasan Yılmaz", "5552002002"],
    ["Oğuz", "Acar", "Cem Acar", "5552002003"],
    ["İrem", "Güneş", "Sibel Güneş", "5552002004"],
    ["Barış", "Kurt", "Ömer Kurt", "5552002005"],
    ["Ceren", "Doğan", "Hatice Doğan", "5552002006"],
    ["Kaan", "Erdoğan", "Yusuf Erdoğan", "5552002007"],
    ["Melis", "Aksoy", "Derya Aksoy", "5552002008"],
    ["Tolga", "Bulut", "Kemal Bulut", "5552002009"],
    ["Sude", "Taş", "Merve Taş", "5552002010"]
  ],
  "12-C": [
    ["Alp", "Tekin", "Ramazan Tekin", "5553003001"],
    ["Buse", "Kılıç", "Nur Kılıç", "5553003002"],
    ["Cem", "Uçar", "İbrahim Uçar", "5553003003"],
    ["Dilara", "Sönmez", "Sevgi Sönmez", "5553003004"],
    ["Efe", "Tunç", "Recep Tunç", "5553003005"],
    ["Fulya", "Bayrak", "Leyla Bayrak", "5553003006"],
    ["Görkem", "Işık", "Tuncay Işık", "5553003007"],
    ["Hazal", "Özkan", "Pınar Özkan", "5553003008"],
    ["İlker", "Vural", "Sinan Vural", "5553003009"],
    ["Jale", "Mutlu", "Esra Mutlu", "5553003010"]
  ]
};

const rows = [["Öğrenci Ad", "Öğrenci Soyad", "Sınıf", "Veli Ad Soyad", "Veli Telefon"]];

for (const [className, students] of Object.entries(studentsByClass)) {
  for (const [firstName, lastName, parentName, parentPhone] of students) {
    rows.push([firstName, lastName, className, parentName, parentPhone]);
  }
}

const sheet = XLSX.utils.aoa_to_sheet(rows);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, sheet, "Ogrenciler");

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));

console.log(`Olusturuldu: ${outPath}`);
console.log(`Toplam ${rows.length - 1} ogrenci (3 sinif x 10)`);
