import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROLES, useAuth } from "../auth/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import StudentTabs from "./StudentTabs";
import ParentTabs from "./ParentTabs";
import { colors, spacing } from "../theme";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { booting, isAuthenticated, user } = useAuth();

  if (booting) {
    return (
      <View style={styles.splash}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>D</Text>
        </View>
        <Text style={styles.splashTitle}>Dershane</Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : user?.mustChangePassword ? (
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      ) : user?.role === ROLES.PARENT ? (
        <Stack.Screen name="ParentApp" component={ParentTabs} />
      ) : (
        <Stack.Screen name="StudentApp" component={StudentTabs} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  logoText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  splashTitle: { marginTop: spacing.md, fontSize: 22, fontWeight: "800", color: colors.text }
});
