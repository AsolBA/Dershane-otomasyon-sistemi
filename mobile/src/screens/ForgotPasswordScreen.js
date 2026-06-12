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
import { authService } from "../services";
import { colors, radius, shadow, spacing } from "../theme";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSuccess(
        "Talebiniz yöneticiye iletildi. Onaylandıktan sonra ChangeMe123! ile giriş yapıp yeni şifre belirleyebilirsiniz."
      );
    } catch (err) {
      setError(err?.message || "Talep gönderilemedi.");
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
          <Text style={styles.title}>Şifremi unuttum</Text>
          <Text style={styles.heroSub}>E-postanızı girin. Yönetici onayından sonra şifreniz sıfırlanır.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="mehmet.student@dershane.local"
            placeholderTextColor={colors.muted}
            editable={!success}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <Pressable
            style={[styles.button, (loading || success) && styles.buttonDisabled]}
            onPress={onSubmit}
            disabled={loading || Boolean(success)}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Yöneticiye talep gönder</Text>}
          </Pressable>

          <Pressable style={styles.linkBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Girişe dön</Text>
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
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  heroSub: { marginTop: 8, fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  label: { fontSize: 13, fontWeight: "600", color: "#334155" },
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
  error: { color: colors.danger, marginTop: spacing.sm, fontSize: 13 },
  success: { color: "#15803d", marginTop: spacing.sm, fontSize: 13, lineHeight: 20 }
});
