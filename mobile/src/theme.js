import { StyleSheet } from "react-native";

export const colors = {
  bg: "#f1f5f9",
  surface: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  primary: "#4f46e5",
  primaryDark: "#4338ca",
  primaryLight: "#eef2ff",
  border: "#e2e8f0",
  danger: "#dc2626",
  dangerLight: "#fef2f2",
  ok: "#059669",
  okBg: "#ecfdf5",
  badBg: "#fef2f2",
  headerBg: "#ffffff"
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20
};

export const shadow = {
  card: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  }
};

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text
  },
  cardMuted: {
    marginTop: 4,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20
  },
  empty: {
    color: colors.muted,
    textAlign: "center",
    marginTop: spacing.xl,
    fontSize: 15
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg
  }
});

export const tabScreenOptions = {
  headerStyle: {
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowOpacity: 0
  },
  headerTitleStyle: {
    fontWeight: "700",
    fontSize: 17,
    color: colors.text
  },
  headerShadowVisible: false,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 58,
    paddingBottom: 6,
    paddingTop: 6
  },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.muted,
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: "600"
  }
};
