import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { schedulesService } from "../../services";
import { colors, spacing } from "../../theme";

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await schedulesService.listForClass(user?.className || "12-A");
      setRows(data);
    } catch (err) {
      alert(err?.message || "Program yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [user?.className]);

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
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.muted}>Program kaydi yok.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>
            {item.day} {item.startTime}-{item.endTime}
          </Text>
          <Text style={styles.muted}>
            {item.courseName} — {item.room}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  list: { padding: spacing.md, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.text },
  muted: { marginTop: 4, color: colors.muted }
});
