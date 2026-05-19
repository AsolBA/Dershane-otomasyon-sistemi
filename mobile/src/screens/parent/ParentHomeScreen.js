import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { attendanceService } from "../../services";
import { colors, spacing } from "../../theme";

export default function ParentHomeScreen() {
  const { user, logout } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const profile = attendanceService.getStudentProfile(user?.linkedStudentId);
        setStudent(profile);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.linkedStudentId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Veli paneli</Text>
      <Text style={styles.muted}>Hos geldin, {user?.name}</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.lg }} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ogrenci</Text>
          <Text style={styles.cardValue}>{student?.fullName}</Text>
          <Text style={styles.muted}>{student?.className} — {student?.email}</Text>
        </View>
      )}

      <Pressable style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Cikis yap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  muted: { marginTop: spacing.xs, color: colors.muted },
  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  cardTitle: { fontSize: 12, color: colors.muted, textTransform: "uppercase" },
  cardValue: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 4 },
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
