import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import StatCard from "../../components/StatCard";
import RefreshableScreen from "../../components/RefreshableScreen";
import { useAuth } from "../../auth/AuthContext";
import { examsService, notificationsService, schedulesService } from "../../services";
import { colors, spacing } from "../../theme";

export default function StudentHomeScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ exams: 0, schedule: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [exams, schedule, notifications] = await Promise.all([
        examsService.listExamsForStudent(user?.id),
        schedulesService.listForClass(user?.className || "12-A"),
        notificationsService.list()
      ]);
      setStats({
        exams: exams.length,
        schedule: schedule.length,
        unread: notifications.filter((n) => !n.read).length
      });
    } catch (err) {
      alert(err?.message || "Ozet yuklenemedi.");
    }
  }, [user]);

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
      <Text style={styles.title}>Merhaba, {user?.name}</Text>
      <Text style={styles.muted}>Sinif: {user?.className || "-"}</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.lg }} />
      ) : (
        <View style={styles.grid}>
          <StatCard label="Sinav" value={String(stats.exams)} hint="Kayitli sonuc" />
          <StatCard label="Ders" value={String(stats.schedule)} hint="Haftalik program" />
          <StatCard label="Bildirim" value={String(stats.unread)} hint="Okunmamis" />
        </View>
      )}

      <Pressable style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Cikis yap</Text>
      </Pressable>
    </RefreshableScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  muted: { marginTop: spacing.xs, color: colors.muted },
  grid: { marginTop: spacing.lg, flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
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
