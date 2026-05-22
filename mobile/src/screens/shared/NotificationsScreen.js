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
import { colors, spacing } from "../../theme";

export default function NotificationsScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    try {
      setRows(await notificationsService.list());
    } catch (err) {
      alert(err?.message || "Bildirimler yuklenemedi.");
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
      alert(err?.message || "Islem basarisiz.");
    }
  }

  async function markAllRead() {
    try {
      await notificationsService.markAllRead();
      await reload();
    } catch (err) {
      alert(err?.message || "Islem basarisiz.");
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
        <Text style={styles.toolbarText}>Okunmamis: {unread}</Text>
        <Pressable onPress={markAllRead} disabled={unread === 0}>
          <Text style={[styles.link, unread === 0 && styles.linkDisabled]}>Tumunu okundu yap</Text>
        </Pressable>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.muted}>Bildirim yok.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.cardUnread]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
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
    paddingVertical: spacing.sm
  },
  toolbarText: { fontWeight: "600", color: colors.text },
  link: { color: colors.primary, fontWeight: "700" },
  linkDisabled: { opacity: 0.4 },
  list: { padding: spacing.md, paddingTop: 0 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  cardUnread: { borderColor: colors.primary },
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
