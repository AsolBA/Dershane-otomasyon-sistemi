import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ParentHomeScreen from "../screens/parent/ParentHomeScreen";
import AttendanceScreen from "../screens/shared/AttendanceScreen";
import ExamResultsScreen from "../screens/shared/ExamResultsScreen";
import AnnouncementsScreen from "../screens/shared/AnnouncementsScreen";
import NotificationsScreen from "../screens/shared/NotificationsScreen";

const Tab = createBottomTabNavigator();

export default function ParentTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Ana Sayfa" component={ParentHomeScreen} />
      <Tab.Screen name="Devamsizlik" component={AttendanceScreen} />
      <Tab.Screen name="Sinavlar" component={ExamResultsScreen} />
      <Tab.Screen name="Duyurular" component={AnnouncementsScreen} />
      <Tab.Screen name="Bildirimler" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}
