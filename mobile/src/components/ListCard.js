import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing } from "../theme";

export default function ListCard({ title, subtitle, footer, onPress, children, pressedStyle }) {
  const content = (
    <>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={subtitleLines(subtitle)}>
          {subtitle}
        </Text>
      ) : null}
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed, pressedStyle]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

function subtitleLines(subtitle) {
  return typeof subtitle === "string" && subtitle.length > 60 ? 2 : 3;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  cardPressed: {
    borderColor: colors.primary,
    opacity: 0.95
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20
  },
  footer: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
