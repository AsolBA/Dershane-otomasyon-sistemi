import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { attendanceService } from "../../services";
import { colors, spacing } from "../../theme";

const LABELS = {
  PRESENT: "Geldi",
  ABSENT: "Gelmedi",
  LATE: "Gec kaldi",
  EXCUSED: "Mazeret"
};

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attendanceService.listAttendanceForParent(user?.linkedStudentId);
      setRows(data);
    } catch (err) {
      alert(err?.message || "Devamsizlik yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [user?.linkedStudentId]);

  useEffect(() => {
    reload();
  }, [reload]);

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
      keyExtractor={(item) => item.date}
      ListEmptyComponent={<Text style={styles.muted}>Kayit yok.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.date}>{item.date}</Text>
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
      <Text style={[styles.pillText, bad ? styles.pillTextBad : styles.pillTextOk]}>{LABELS[status] || status}</Text>
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  date: { fontWeight: "700", color: colors.text },
  muted: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillOk: { backgroundColor: colors.okBg },
  pillBad: { backgroundColor: colors.badBg },
  pillText: { fontSize: 13, fontWeight: "600" },
  pillTextOk: { color: colors.ok },
  pillTextBad: { color: colors.danger }
});
