import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { ROLES, useAuth } from "../../auth/AuthContext";
import { examsService } from "../../services";
import { colors, commonStyles, radius, shadow, spacing } from "../../theme";

export default function ExamResultsScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    try {
      const data =
        user?.role === ROLES.PARENT
          ? await examsService.listExamsForParent(user.linkedStudentId)
          : await examsService.listExamsForStudent(user?.id);
      setRows(data);
    } catch (err) {
      alert(err?.message || "Sınavlar yüklenemedi.");
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
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text style={commonStyles.empty}>Sınav kaydı yok.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.muted}>{item.date}</Text>
          <Text style={styles.score}>{item.score == null ? "Sonuç girilmedi" : `Puan: ${item.score}`}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  list: { padding: spacing.md, gap: spacing.sm, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.text },
  muted: { marginTop: 4, color: colors.muted },
  score: { marginTop: 8, fontWeight: "600", color: colors.primary }
});
