import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatAnnouncementScope, formatDateTime } from "../utils/labels";
import { colors, radius, spacing } from "../theme";

export default function AnnouncementDetailModal({ visible, item, onClose }) {
  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Duyuru detayı</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>Kapat</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{item.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{formatAnnouncementScope(item.scope, item.className)}</Text>
              </View>
              <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
            </View>

            <Text style={styles.body}>{item.body}</Text>

            {item.author ? (
              <Text style={styles.footer}>
                Yayınlayan: <Text style={styles.footerStrong}>{item.author}</Text>
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end"
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.lg
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: { fontSize: 14, fontWeight: "700", color: colors.muted, textTransform: "uppercase" },
  close: { fontSize: 15, fontWeight: "700", color: colors.primary },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, lineHeight: 28 },
  metaRow: { marginTop: spacing.md, gap: spacing.sm },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  badgeText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  date: { fontSize: 13, color: colors.muted },
  body: {
    marginTop: spacing.lg,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text
  },
  footer: { marginTop: spacing.lg, fontSize: 13, color: colors.muted },
  footerStrong: { fontWeight: "700", color: colors.text }
});
