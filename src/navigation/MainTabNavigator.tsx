import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { MainTabParamList } from "../types/navigation";
import HomeScreen from "../screens/HomeScreen";
import BookingScreen from "../screens/BookingScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS: Record<string, { label: string; icon: keyof typeof Feather.glyphMap }> = {
  Home: { label: "Beranda", icon: "home" },
  Booking: { label: "Layanan", icon: "calendar" },
  History: { label: "Riwayat", icon: "bookmark" },
  Profile: { label: "Profil", icon: "user" },
};

function WhiteBlueTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = TABS[route.name] || { label: route.name, icon: "circle" };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.85}
            style={[styles.tabItem, focused && styles.tabItemActive]}
          >
            <Feather
              name={meta.icon}
              size={18}
              color={focused ? "#1E60D5" : "#94A3B8"}
            />
            {focused && <Text style={styles.tabLabel}>{meta.label}</Text>}
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
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
  },
  tabItemActive: {
    backgroundColor: "#EBF3FE",
    paddingHorizontal: 15,
  },
  tabLabel: {
    color: "#1E60D5",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 7,
  },
});