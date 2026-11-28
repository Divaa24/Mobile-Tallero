import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { MainTabParamList } from "../types/navigation";
import HomeScreen from "../screens/HomeScreen";
import BookingScreen from "../screens/BookingScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG: Record<string, { label: string; active: any; inactive: any }> = {
  Home: { label: "Beranda", active: "home", inactive: "home-outline" },
  Booking: { label: "Layanan", active: "grid", inactive: "grid-outline" },
  History: { label: "Riwayat", active: "calendar", inactive: "calendar-outline" },
  Profile: { label: "Profil", active: "person", inactive: "person-outline" },
};

function WhiteBlueTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const cfg = TAB_CONFIG[route.name] || {
          label: route.name,
          active: "ellipse",
          inactive: "ellipse-outline",
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.85}
            style={[styles.tabItem, focused && styles.tabItemActive]}
          >
            <Ionicons
              name={focused ? cfg.active : cfg.inactive}
              size={20}
              color={focused ? "#1D4ED8" : "#94A3B8"}
            />
            {focused && <Text style={styles.tabText}>{cfg.label}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <WhiteBlueTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 26 : 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
  },
  tabItemActive: { backgroundColor: "#EFF6FF", paddingHorizontal: 14 },
  tabText: { color: "#1D4ED8", fontSize: 12, fontWeight: "600", marginLeft: 6 },
});