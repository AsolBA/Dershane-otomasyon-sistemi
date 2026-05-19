import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROLES, useAuth } from "../auth/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import StudentTabs from "./StudentTabs";
import ParentTabs from "./ParentTabs";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { booting, isAuthenticated, user } = useAuth();

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user?.role === ROLES.PARENT ? (
        <Stack.Screen name="ParentApp" component={ParentTabs} />
      ) : (
        <Stack.Screen name="StudentApp" component={StudentTabs} />
      )}
    </Stack.Navigator>
  );
}
