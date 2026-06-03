import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import AnnouncementDetailModal from "../../components/AnnouncementDetailModal";
import { useAuth } from "../../auth/AuthContext";
import { announcementsService } from "../../services";
import { formatAnnouncementScope, formatDateTime } from "../../utils/labels";
import { colors, commonStyles, radius, shadow, spacing } from "../../theme";

export default function AnnouncementsScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const reload = useCallback(async () => {
    try {
      const data = await announcementsService.listForUser({
        role: user?.role,
        className: user?.className || "12-A"
      });
      setRows(data);
    } catch (err) {
      alert(err?.message || "Duyurular yüklenemedi.");
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
    <>
      <FlatList
        contentContainerStyle={styles.list}
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={commonStyles.empty}>Henüz duyuru yok.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => setSelected(item)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.preview} numberOfLines={2}>
              {item.body}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.meta}>{formatAnnouncementScope(item.scope, item.className)}</Text>
              <Text style={styles.hint}>Detay için dokun</Text>
            </View>
            <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
          </Pressable>
        )}
      />

      <AnnouncementDetailModal visible={Boolean(selected)} item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  list: { padding: spacing.md, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  cardPressed: { opacity: 0.92, borderColor: colors.primary },
  title: { fontSize: 16, fontWeight: "700", color: colors.text },
  preview: { marginTop: 6, color: colors.text, lineHeight: 20 },
  cardFooter: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  meta: { fontSize: 12, fontWeight: "600", color: colors.primary, flex: 1 },
  hint: { fontSize: 11, color: colors.muted },
  date: { marginTop: 6, fontSize: 12, color: colors.muted },
  muted: { color: colors.muted, textAlign: "center", marginTop: spacing.lg }
});
