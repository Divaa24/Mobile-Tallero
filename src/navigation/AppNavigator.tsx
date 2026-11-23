import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Placeholder sementara sebelum kita bangun Bottom Tabs & HomeScreen
function PlaceholderMainApp({ navigation }: any) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-6">
      <Text className="text-tallero-navy text-xl font-extrabold">
        Beranda Utama Tallero
      </Text>
      <Text className="text-slate-500 text-xs text-center mt-1 mb-6">
        Login berhasil! Siap lanjut bangun Bottom Tab & halaman Beranda.
      </Text>
      <TouchableOpacity
        onPress={() => navigation.replace("Login")}
        className="bg-tallero-navy px-5 py-3 rounded-xl"
      >
        <Text className="text-white text-xs font-bold">Kembali ke Login</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AppNavigator() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainApp" component={PlaceholderMainApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}