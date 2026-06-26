import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { ROLES, useAuth } from "../../auth/AuthContext";
import { attendanceService } from "../../services";
import { ATTENDANCE_STATUS_LABELS } from "../../utils/labels";
import { colors, commonStyles, radius, shadow, spacing } from "../../theme";

function resolveStudentId(user) {
  if (user?.role === ROLES.STUDENT) return user?.studentId;
  return user?.linkedStudentId;
}

function rowKey(row) {
  return String(row.id ?? `${row.scheduleId || "na"}__${row.date}`);
}

export default function AttendanceScreen() {
  const { user } = useAuth();
  const studentId = resolveStudentId(user);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    try {
      const data = await attendanceService.listAttendanceForStudent(studentId);
      setRows(data);
    } catch (err) {
      alert(err?.message || "Devamsızlık yüklenemedi.");
    }
  }, [studentId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await reload();
      setLoading(false);
    })();
  }, [reload]);

  async function onRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={rows}
      keyExtractor={rowKey}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text style={commonStyles.empty}>Kayıt yok.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardMain}>
            <Text style={styles.date}>{item.date}</Text>
            {item.courseName ? <Text style={styles.course}>{item.courseName}</Text> : null}
            {item.teacherName ? <Text style={styles.teacher}>{item.teacherName}</Text> : null}
          </View>
          <StatusPill status={item.status} />
        </View>
      )}
    />
  );
}

function StatusPill({ status }) {
  const bad = status === "ABSENT";
  return (
    <View style={[styles.pill, bad ? styles.pillBad : styles.pillOk]}>
      <Text style={[styles.pillText, bad ? styles.pillTextBad : styles.pillTextOk]}>
        {ATTENDANCE_STATUS_LABELS[status] || status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  list: { padding: spacing.md, backgroundColor: colors.bg },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  cardMain: { flex: 1, marginRight: spacing.sm },
  date: { fontWeight: "700", color: colors.text },
  course: { marginTop: 4, fontWeight: "600", color: colors.text },
  teacher: { marginTop: 2, color: colors.muted, fontSize: 13 },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillOk: { backgroundColor: colors.okBg },
  pillBad: { backgroundColor: colors.badBg },
  pillText: { fontSize: 13, fontWeight: "600" },
  pillTextOk: { color: colors.ok },
  pillTextBad: { color: colors.danger }
});
