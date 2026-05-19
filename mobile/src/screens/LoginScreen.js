import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { ROLES, useAuth } from "../auth/AuthContext";
import { USE_MOCK_API } from "../services";
import { colors, spacing } from "../theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("student@dershane.local");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.STUDENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit() {
    setError("");
    setLoading(true);
    try {
      await login({ email, password, role });
    } catch (err) {
      setError(err?.message || "Giris basarisiz.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dershane</Text>
      <Text style={styles.subtitle}>{USE_MOCK_API ? "Mock giris (gelistirme)" : "Hesabinla giris yap"}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>E-posta</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />

        <Text style={styles.label}>Sifre</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        {USE_MOCK_API ? (
          <>
            <Text style={styles.label}>Rol (mock)</Text>
            <View style={styles.roleRow}>
              <RoleChip label="Ogrenci" active={role === ROLES.STUDENT} onPress={() => setRole(ROLES.STUDENT)} />
              <RoleChip label="Veli" active={role === ROLES.PARENT} onPress={() => setRole(ROLES.PARENT)} />
            </View>
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Giris yap</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function RoleChip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 14, color: colors.muted, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.lg },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: spacing.md, gap: spacing.sm },
  label: { fontSize: 13, color: colors.muted, marginTop: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15
  },
  roleRow: { flexDirection: "row", gap: spacing.sm },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center"
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: colors.danger, marginTop: spacing.xs }
});
