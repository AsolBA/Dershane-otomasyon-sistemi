import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import StudentHomeScreen from "../screens/student/StudentHomeScreen";
import ExamResultsScreen from "../screens/shared/ExamResultsScreen";
import ScheduleScreen from "../screens/shared/ScheduleScreen";
import AnnouncementsScreen from "../screens/shared/AnnouncementsScreen";

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Ana Sayfa" component={StudentHomeScreen} />
      <Tab.Screen name="Sinavlar" component={ExamResultsScreen} />
      <Tab.Screen name="Program" component={ScheduleScreen} />
      <Tab.Screen name="Duyurular" component={AnnouncementsScreen} />
    </Tab.Navigator>
  );
}
