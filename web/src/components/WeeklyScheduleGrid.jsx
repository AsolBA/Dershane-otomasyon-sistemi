import { useMemo } from "react";
import { formatDay } from "../utils/labels";
import { buildWeeklyScheduleGrid } from "../utils/scheduleGrid";

export default function WeeklyScheduleGrid({ items, courseLabelById, teacherNameById, emptyMessage }) {
  const grid = useMemo(
    () => buildWeeklyScheduleGrid(items, { courseLabelById, teacherNameById }),
    [items, courseLabelById, teacherNameById]
  );

  if (!items?.length) {
    return <p className="muted">{emptyMessage || "Program kaydı yok."}</p>;
  }

  return (
    <div className="schedule-grid-wrap">
      <table className="schedule-grid">
        <thead>
          <tr>
            {grid.days.map((day) => (
              <th key={day}>{formatDay(day)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: grid.maxRows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {grid.days.map((day) => {
                const cell = grid.cellAt(day, rowIndex);
                return (
                  <td key={`${day}-${rowIndex}`}>
                    {cell ? (
                      <div className="schedule-cell">
                        <div className="schedule-cell-time">
                          {cell.startTime}–{cell.endTime}
                        </div>
                        <div className="schedule-cell-course">{cell.courseName}</div>
                        <div className="schedule-cell-meta">Derslik: {cell.room || "—"}</div>
                        <div className="schedule-cell-meta">Hoca: {cell.teacherName}</div>
                      </div>
                    ) : (
                      <div className="schedule-cell schedule-cell-empty" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
