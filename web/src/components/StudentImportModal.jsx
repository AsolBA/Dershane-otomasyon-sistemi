import { useMemo, useState } from "react";
import { studentsService } from "../services";
import { normalizeEmail } from "../utils/email";

export default function StudentImportModal({ rows, fileName, onClose, onImported }) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const validRows = useMemo(() => rows.filter((r) => r.valid), [rows]);
  const invalidRows = useMemo(() => rows.filter((r) => !r.valid), [rows]);

  async function confirmImport() {
    if (!validRows.length || importing) return;
    setImporting(true);
    const failures = [];
    let successCount = 0;
    const importedEmails = new Set();

    for (const row of validRows) {
      const emailKey = normalizeEmail(row.studentEmail);
      if (emailKey && importedEmails.has(emailKey)) {
        failures.push({
          rowNumber: row.rowNumber,
          name: `${row.firstName} ${row.lastName}`,
          message: "Aynı dosyada tekrar eden öğrenci atlandı."
        });
        continue;
      }

      try {
        await studentsService.create({
          firstName: row.firstName,
          lastName: row.lastName,
          className: row.className,
          parentName: row.parentName,
          parentPhone: row.parentPhone,
          active: true
        });
        if (emailKey) importedEmails.add(emailKey);
        successCount += 1;
      } catch (err) {
        failures.push({
          rowNumber: row.rowNumber,
          name: `${row.firstName} ${row.lastName}`,
          message: err?.message || "Kayıt başarısız."
        });
      }
    }

    setResult({ successCount, failures });
    setImporting(false);
    if (successCount > 0) onImported?.();
  }

  function closeModal() {
    if (importing) return;
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={closeModal}>
      <div
        className="modal-card modal-card--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-import-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Toplu öğrenci içe aktarma</div>
            <h2 id="student-import-title" style={{ margin: 0 }}>
              Ön izleme
            </h2>
            {fileName ? <p className="muted" style={{ margin: "6px 0 0" }}>{fileName}</p> : null}
          </div>
          <button className="btn" type="button" onClick={closeModal} disabled={importing}>
            Kapat
          </button>
        </div>

        <div className="modal-meta">
          <span className="pill ok">{validRows.length} geçerli satır</span>
          {invalidRows.length ? <span className="pill bad">{invalidRows.length} hatalı satır</span> : null}
        </div>

        <p className="muted" style={{ marginTop: 0 }}>
          Excel sütunları: <strong>Öğrenci Ad</strong>, <strong>Öğrenci Soyad</strong>, <strong>Sınıf</strong>,{" "}
          <strong>Veli Ad Soyad</strong>, <strong>Veli Telefon</strong>. E-postalar otomatik oluşturulur.
        </p>

        <div className="table-wrap import-preview-wrap">
          <table className="import-preview-table">
            <thead>
              <tr>
                <th>Satır</th>
                <th>Öğrenci</th>
                <th>Sınıf</th>
                <th>Veli</th>
                <th>Öğrenci e-posta</th>
                <th>Veli e-posta</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rowNumber} className={row.valid ? "" : "import-row-invalid"}>
                  <td>{row.rowNumber}</td>
                  <td>
                    {row.firstName} {row.lastName}
                  </td>
                  <td>{row.className || "—"}</td>
                  <td>
                    <div>{row.parentName || "—"}</div>
                    <div className="muted">{row.parentPhone || "—"}</div>
                  </td>
                  <td className="muted">{row.studentEmail || "—"}</td>
                  <td className="muted">{row.parentEmail || "—"}</td>
                  <td>
                    {row.valid ? (
                      <span className="pill ok">Hazır</span>
                    ) : (
                      <span className="pill bad">{row.errors.join(" ")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result ? (
          <div className="modal-section">
            <div className="modal-section-title">İçe aktarma sonucu</div>
            <p>
              <strong>{result.successCount}</strong> öğrenci kaydedildi.
              {result.failures.length ? (
                <>
                  {" "}
                  <strong>{result.failures.length}</strong> satırda hata oluştu.
                </>
              ) : null}
            </p>
            {result.failures.length ? (
              <ul className="import-failures">
                {result.failures.map((f) => (
                  <li key={`${f.rowNumber}-${f.name}`}>
                    Satır {f.rowNumber} ({f.name}): {f.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="modal-actions">
          <button className="btn" type="button" onClick={closeModal} disabled={importing}>
            {result ? "Kapat" : "İptal"}
          </button>
          {!result ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={confirmImport}
              disabled={importing || validRows.length === 0}
            >
              {importing ? "Kaydediliyor…" : `${validRows.length} öğrenciyi onayla ve kaydet`}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
