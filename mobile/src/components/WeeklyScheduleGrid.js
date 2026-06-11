import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { formatDay } from "../utils/labels";
import { buildWeeklyScheduleGrid } from "../utils/scheduleGrid";
import { colors, radius, spacing } from "../theme";

const DAY_WIDTH = 148;

export default function WeeklyScheduleGrid({ items, emptyMessage }) {
  const grid = useMemo(() => buildWeeklyScheduleGrid(items), [items]);

  if (!items?.length) {
    return <Text style={styles.empty}>{emptyMessage || "Program kaydı yok."}</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <View style={styles.headerRow}>
          {grid.days.map((day) => (
            <View key={day} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{formatDay(day)}</Text>
            </View>
          ))}
        </View>

        {Array.from({ length: grid.maxRows }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {grid.days.map((day) => {
              const cell = grid.cellAt(day, rowIndex);
              return (
                <View key={`${day}-${rowIndex}`} style={styles.cellWrap}>
                  {cell ? (
                    <View style={styles.cell}>
                      <Text style={styles.time}>
                        {cell.startTime}–{cell.endTime}
                      </Text>
                      <Text style={styles.course}>{cell.courseName}</Text>
                      <Text style={styles.meta}>Derslik: {cell.room || "—"}</Text>
                      <Text style={styles.meta}>Hoca: {cell.teacherName || "—"}</Text>
                    </View>
                  ) : (
                    <View style={styles.cellEmpty} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.muted, fontSize: 14 },
  headerRow: { flexDirection: "row" },
  dayHeader: {
    width: DAY_WIDTH,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: "center"
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase"
  },
  row: { flexDirection: "row" },
  cellWrap: {
    width: DAY_WIDTH,
    padding: spacing.xs
  },
  cell: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    minHeight: 96
  },
  cellEmpty: { minHeight: 8 },
  time: { fontSize: 11, fontWeight: "700", color: colors.primary, marginBottom: 4 },
  course: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 4 },
  meta: { fontSize: 12, color: colors.muted, lineHeight: 16 }
});
