import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { colors, spacing } from "../../theme";

export default function StudentHomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Merhaba, {user?.name}</Text>
      <Text style={styles.muted}>Sinif: {user?.className || "-"}</Text>
      <Text style={styles.muted}>Alt menuden sinav, program ve duyurulara gidebilirsin.</Text>

      <Pressable style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Cikis yap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  muted: { marginTop: spacing.sm, color: colors.muted, lineHeight: 20 },
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
