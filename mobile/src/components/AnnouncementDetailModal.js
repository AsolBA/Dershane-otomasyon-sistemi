import React from "react";
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { readStoredSession } from "../auth/storage";
import { announcementsService } from "../services";
import { formatAnnouncementScope, formatDateTime } from "../utils/labels";
import { colors, radius, spacing } from "../theme";

function formatFileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AnnouncementDetailModal({ visible, item, onClose }) {
  if (!item) return null;

  async function openAttachment(att) {
    try {
      const session = await readStoredSession();
      const url = announcementsService.getAttachmentOpenUrl(item.id, att.id, session.accessToken);
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Dosya", "Bu dosya turu acilamiyor.");
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert("Dosya", err?.message || "Ek acilamadi.");
    }
  }

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

            <Text style={styles.sectionTitle}>Ekler</Text>
            {!item.attachments?.length ? (
              <Text style={styles.mutedSmall}>Ek dosya yok.</Text>
            ) : (
              item.attachments.map((att) => (
                <Pressable key={att.id} style={styles.attachmentRow} onPress={() => openAttachment(att)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attachmentName}>{att.name}</Text>
                    <Text style={styles.mutedSmall}>{formatFileSize(att.size)}</Text>
                  </View>
                  <Text style={styles.openHint}>Aç</Text>
                </Pressable>
              ))
            )}
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
  sectionTitle: { marginTop: spacing.lg, fontSize: 15, fontWeight: "700", color: colors.text },
  mutedSmall: { marginTop: 8, fontSize: 13, color: colors.muted },
  attachmentRow: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  attachmentName: { fontSize: 15, fontWeight: "600", color: colors.text },
  openHint: { fontSize: 13, fontWeight: "700", color: colors.primary }
});
