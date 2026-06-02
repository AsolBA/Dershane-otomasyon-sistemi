import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import StatCard from "../../components/StatCard";
import WelcomeBanner from "../../components/WelcomeBanner";
import RefreshableScreen from "../../components/RefreshableScreen";
import { useAuth } from "../../auth/AuthContext";
import { attendanceService, examsService, notificationsService } from "../../services";
import { colors, radius, shadow, spacing } from "../../theme";

export default function ParentHomeScreen() {
  const { user, logout } = useAuth();
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({ absent: 0, exams: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    try {
      const studentId = user?.linkedStudentId;
      const profile = await attendanceService.getStudentProfile(studentId);
      setStudent(profile);

      const [attendance, exams, notifications] = await Promise.all([
        attendanceService.listAttendanceForParent(studentId),
        examsService.listExamsForParent(studentId),
        notificationsService.list()
      ]);

      setStats({
        absent: attendance.filter((a) => a.status === "ABSENT").length,
        exams: exams.length,
        unread: notifications.filter((n) => !n.read).length
      });
    } catch (err) {
      alert(err?.message || "Özet yüklenemedi.");
    }
  }, [user?.linkedStudentId]);

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

  return (
    <RefreshableScreen refreshing={refreshing} onRefresh={onRefresh}>
      <WelcomeBanner title="Veli paneli" subtitle={`Hoş geldiniz, ${user?.name || "Veli"}`} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.lg }} />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Öğrenci</Text>
            <Text style={styles.cardValue}>{student?.fullName}</Text>
            <Text style={styles.muted}>
              {student?.className} — {student?.email}
            </Text>
          </View>

          <View style={styles.grid}>
            <StatCard label="Devamsız" value={String(stats.absent)} hint="Bu dönem" />
            <StatCard label="Sınav" value={String(stats.exams)} hint="Sonuç kaydı" />
            <StatCard label="Bildirim" value={String(stats.unread)} hint="Okunmamış" />
          </View>
        </>
      )}

      <Pressable style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Çıkış yap</Text>
      </Pressable>
    </RefreshableScreen>
  );
}

const styles = StyleSheet.create({
  muted: { marginTop: spacing.xs, color: colors.muted, fontSize: 14 },
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  cardLabel: { fontSize: 12, color: colors.muted, textTransform: "uppercase" },
  cardValue: { marginTop: 4, fontSize: 18, fontWeight: "700", color: colors.text },
  grid: { marginTop: spacing.md, flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  logout: {
    marginTop: spacing.lg,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  logoutText: { color: colors.danger, fontWeight: "700" }
});
