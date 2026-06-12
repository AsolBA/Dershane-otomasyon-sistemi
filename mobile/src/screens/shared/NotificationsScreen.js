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
  const [selectedIds, setSelectedIds] = useState([]);

  const reload = useCallback(async () => {
    try {
      setRows(await notificationsService.list());
      setSelectedIds([]);
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

  async function deleteSelected() {
    if (!selectedIds.length) return;
    if (!confirm(`${selectedIds.length} bildirim kalıcı olarak silinsin mi?`)) return;
    try {
      await notificationsService.removeMany(selectedIds);
      await reload();
    } catch (err) {
      alert(err?.message || "Silme başarısız.");
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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
        <Text style={styles.toolbarText}>
          Okunmamış: {unread}
          {selectedIds.length ? ` · Seçili: ${selectedIds.length}` : ""}
        </Text>
        <View style={styles.toolbarLinks}>
          {selectedIds.length ? (
            <Pressable onPress={deleteSelected}>
              <Text style={styles.linkDanger}>Seçilenleri sil</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={markAllRead} disabled={unread === 0}>
            <Text style={[styles.link, unread === 0 && styles.linkDisabled]}>Tümünü okundu yap</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={commonStyles.empty}>Bildirim yok.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.cardUnread, selectedIds.includes(item.id) && styles.cardSelected]}>
            <Pressable onPress={() => toggleSelect(item.id)} style={styles.selectRow}>
              <View style={[styles.checkbox, selectedIds.includes(item.id) && styles.checkboxActive]} />
              <Text style={styles.selectHint}>{selectedIds.includes(item.id) ? "Seçili" : "Seç"}</Text>
            </Pressable>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
            <View style={styles.actions}>
              {!item.read ? (
                <Pressable style={styles.btn} onPress={() => markRead(item.id)}>
                  <Text style={styles.btnText}>Okundu</Text>
                </Pressable>
              ) : null}
            </View>
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
    borderBottomColor: colors.border,
    gap: spacing.sm
  },
  toolbarText: { fontWeight: "600", color: colors.text, flex: 1 },
  toolbarLinks: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  link: { color: colors.primary, fontWeight: "700" },
  linkDanger: { color: colors.danger, fontWeight: "700" },
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
  cardSelected: { borderColor: colors.danger },
  selectRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.sm },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: "#fff"
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectHint: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  title: { fontSize: 16, fontWeight: "700", color: colors.text },
  body: { marginTop: 6, color: colors.text },
  meta: { marginTop: 8, fontSize: 12, color: colors.muted },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 13 }
});
