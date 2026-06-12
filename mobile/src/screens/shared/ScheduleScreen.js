import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import WeeklyScheduleGrid from "../../components/WeeklyScheduleGrid";
import { ROLES, useAuth } from "../../auth/AuthContext";
import { schedulesService, studentsService } from "../../services";
import { colors, spacing } from "../../theme";

export default function ScheduleScreen() {
  const { user } = useAuth();
  const isParent = user?.role === ROLES.PARENT;
  const [rows, setRows] = useState([]);
  const [classLabel, setClassLabel] = useState(user?.className || "");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    try {
      if (user?.role === ROLES.STUDENT) {
        setClassLabel(user.className || "");
        setRows(await schedulesService.list({}));
        return;
      }

      if (isParent) {
        const data = await schedulesService.list({});
        setRows(data);
        let cn = "";
        if (user?.linkedStudentId) {
          try {
            const student = await studentsService.getById(user.linkedStudentId);
            cn = student.className || "";
          } catch {
            /* devam */
          }
        }
        if (!cn && data[0]?.className) cn = data[0].className;
        setClassLabel(cn);
        return;
      }

      const cn = user?.className || "";
      setClassLabel(cn);
      setRows(cn ? await schedulesService.listForClass(cn) : await schedulesService.list({}));
    } catch (err) {
      alert(err?.message || "Program yüklenemedi.");
    }
  }, [user, isParent]);

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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {classLabel ? (
        <Text style={styles.header}>
          <Text style={styles.headerStrong}>{classLabel}</Text> sınıfı haftalık programı
        </Text>
      ) : null}

      <WeeklyScheduleGrid items={rows} emptyMessage="Bu sınıf için program kaydı yok." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  container: { padding: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  header: { marginBottom: spacing.md, color: colors.muted, fontSize: 14 },
  headerStrong: { fontWeight: "700", color: colors.text }
});
