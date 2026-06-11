import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ParentHomeScreen from "../screens/parent/ParentHomeScreen";
import AttendanceScreen from "../screens/shared/AttendanceScreen";
import ExamResultsScreen from "../screens/shared/ExamResultsScreen";
import AnnouncementsScreen from "../screens/shared/AnnouncementsScreen";
import NotificationsScreen from "../screens/shared/NotificationsScreen";
import ScheduleScreen from "../screens/shared/ScheduleScreen";
import { tabScreenOptions } from "../theme";

const Tab = createBottomTabNavigator();

export default function ParentTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Ana Sayfa" component={ParentHomeScreen} />
      <Tab.Screen name="Program" component={ScheduleScreen} />
      <Tab.Screen name="Devamsızlık" component={AttendanceScreen} />
      <Tab.Screen name="Sınavlar" component={ExamResultsScreen} />
      <Tab.Screen name="Duyurular" component={AnnouncementsScreen} />
      <Tab.Screen name="Bildirimler" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}
