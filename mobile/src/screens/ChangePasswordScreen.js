import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { validateNewPassword } from "../utils/passwordPolicy";
import { colors, radius, shadow, spacing } from "../theme";

export default function ChangePasswordScreen() {
  const { user, changePassword, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit() {
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }

    const policy = validateNewPassword(newPassword);
    if (!policy.ok) {
      setError(policy.errors.join(" "));
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
    } catch (err) {
      setError(err?.message || "Şifre güncellenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.wrap} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <Text style={styles.title}>Şifrenizi değiştirin</Text>
          <Text style={styles.heroSub}>
            {user?.email ? `${user.email}\n` : ""}
            İlk girişte güvenliğiniz için yeni bir şifre belirlemeniz gerekir.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Mevcut şifre</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Yeni şifre</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Yeni şifre (tekrar)</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.hint}>
            En az 8 karakter; büyük harf, küçük harf ve rakam içermeli. Varsayılan şifre kullanılamaz.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Şifreyi güncelle</Text>}
          </Pressable>

          <Pressable style={styles.linkBtn} onPress={logout}>
            <Text style={styles.linkText}>Çıkış yap</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: spacing.lg },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadow.card
  },
  logoText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "center" },
  heroSub: { marginTop: 8, fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginTop: 6,
    backgroundColor: "#fafafa",
    color: colors.text
  },
  hint: { marginTop: spacing.sm, fontSize: 12, color: colors.muted, lineHeight: 18 },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 15,
    alignItems: "center",
    ...shadow.card
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  linkBtn: { marginTop: spacing.md, alignItems: "center", paddingVertical: 8 },
  linkText: { color: colors.primary, fontWeight: "600" },
  error: { color: colors.danger, marginTop: spacing.sm, fontSize: 13 }
});
