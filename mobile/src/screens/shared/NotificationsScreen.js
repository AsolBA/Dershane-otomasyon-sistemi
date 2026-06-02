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
import { notificationsService } from "../../services";
import { formatDateTime } from "../../utils/labels";
import { colors, commonStyles, radius, shadow, spacing } from "../../theme";

export default function NotificationsScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    try {
      setRows(await notificationsService.list());
    } catch (err) {
      alert(err?.message || "Bildirimler yüklenemedi.");
    }
  }, []);

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

  async function markRead(id) {
    try {
      await notificationsService.markRead(id);
      await reload();
    } catch (err) {
      alert(err?.message || "İşlem başarısız.");
    }
  }

  async function markAllRead() {
    try {
      await notificationsService.markAllRead();
      await reload();
    } catch (err) {
      alert(err?.message || "İşlem başarısız.");
    }
  }

  const unread = rows.filter((r) => !r.read).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarText}>Okunmamış: {unread}</Text>
        <Pressable onPress={markAllRead} disabled={unread === 0}>
          <Text style={[styles.link, unread === 0 && styles.linkDisabled]}>Tümünü okundu yap</Text>
        </Pressable>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={commonStyles.empty}>Bildirim yok.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.cardUnread]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
            {!item.read ? (
              <Pressable style={styles.btn} onPress={() => markRead(item.id)}>
                <Text style={styles.btnText}>Okundu</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  toolbarText: { fontWeight: "600", color: colors.text },
  link: { color: colors.primary, fontWeight: "700" },
  linkDisabled: { opacity: 0.4 },
  list: { padding: spacing.md, paddingTop: 0 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  cardUnread: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  title: { fontSize: 16, fontWeight: "700", color: colors.text },
  body: { marginTop: 6, color: colors.text },
  meta: { marginTop: 8, fontSize: 12, color: colors.muted },
  btn: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  muted: { color: colors.muted, textAlign: "center", marginTop: spacing.lg }
});
