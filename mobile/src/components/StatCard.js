import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing } from "../theme";

export default function StatCard({ label, value, hint }) {
  return (
    <View style={styles.card}>
      <View style={styles.accent} />
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingTop: spacing.md + 4,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.card
  },
  accent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary
  },
  label: {
    fontSize: 11,
    color: colors.muted,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5
  },
  value: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    color: colors.muted
  }
});
