import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import StudentHomeScreen from "../screens/student/StudentHomeScreen";
import ExamResultsScreen from "../screens/shared/ExamResultsScreen";
import ScheduleScreen from "../screens/shared/ScheduleScreen";
import AttendanceScreen from "../screens/shared/AttendanceScreen";
import AnnouncementsScreen from "../screens/shared/AnnouncementsScreen";
import NotificationsScreen from "../screens/shared/NotificationsScreen";
import { tabScreenOptions } from "../theme";

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Ana Sayfa" component={StudentHomeScreen} />
      <Tab.Screen name="Sınavlar" component={ExamResultsScreen} />
      <Tab.Screen name="Program" component={ScheduleScreen} />
      <Tab.Screen name="Devamsızlık" component={AttendanceScreen} />
      <Tab.Screen name="Duyurular" component={AnnouncementsScreen} />
      <Tab.Screen name="Bildirimler" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}
