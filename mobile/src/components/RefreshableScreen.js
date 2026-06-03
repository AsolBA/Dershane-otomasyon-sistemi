import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { colors, spacing } from "../theme";

export default function RefreshableScreen({ children, refreshing, onRefresh, scroll = true }) {
  if (!scroll) {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    padding: spacing.md
  }
});
