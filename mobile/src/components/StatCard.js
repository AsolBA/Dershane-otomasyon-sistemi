import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

export default function StatCard({ label, value, hint }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  label: { fontSize: 12, color: colors.muted, textTransform: "uppercase" },
  value: { marginTop: 6, fontSize: 22, fontWeight: "800", color: colors.text },
  hint: { marginTop: 4, fontSize: 12, color: colors.muted }
});
