import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import api, { unwrapData, getErrorMessage } from "../services/api";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Data Belum Lengkap", "Masukkan email dan kata sandi terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const payload = unwrapData(res);
      const token = payload?.token || res?.data?.token;
      const user = payload?.user || payload;

      if (token) {
        await AsyncStorage.setItem("tallero_token", token);
      }
      if (user) {
        await AsyncStorage.setItem("tallero_user", JSON.stringify(user));
      }

      navigation.replace("MainApp");
    } catch (error) {
      Alert.alert("Login Gagal", getErrorMessage(error, "Email atau kata sandi salah."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-50"
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={["#012436", "#013C58", "#00537A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-16 pb-20 px-6 rounded-b-[36px] items-center"
        >
          <View className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-lg mb-3">
            <FontAwesome6 name="gear" size={28} color="#013C58" />
          </View>
          <Text className="text-white text-2xl font-extrabold tracking-[4px]">
            TALLERO
          </Text>
          <Text className="text-tallero-sky text-xs font-medium mt-1">
            Masuk untuk kelola servis kendaraanmu
          </Text>
        </LinearGradient>

        <View className="px-6 -mt-12 flex-1 justify-between pb-8">
          <View className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
            <Text className="text-tallero-navy text-xl font-extrabold mb-1">
              Selamat Datang
            </Text>
            <Text className="text-slate-400 text-xs mb-6">
              Silakan masuk menggunakan akun pelanggan Tallero
            </Text>

            <Text className="text-tallero-navy text-xs font-bold mb-2">
              Email
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
              <FontAwesome6 name="envelope" size={14} color="#00537A" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="nama@email.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 text-slate-800 text-sm"
              />
            </View>

            <Text className="text-tallero-navy text-xs font-bold mb-2">
              Kata Sandi
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
              <FontAwesome6 name="lock" size={14} color="#00537A" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan kata sandi"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                className="flex-1 ml-3 text-slate-800 text-sm"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome6
                  name={showPassword ? "eye-slash" : "eye"}
                  size={14}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              className="bg-tallero-navy py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text className="text-white font-bold text-sm tracking-wide">
                    Masuk Sekarang
                  </Text>
                  <FontAwesome6 name="arrow-right" size={13} color="#F5A201" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.replace("MainApp")}
              activeOpacity={0.8}
              className="mt-3 py-3 rounded-xl border border-tallero-amber/60 bg-tallero-amber/10 items-center"
            >
              <Text className="text-tallero-navy text-xs font-bold">
                Lewati Login (Mode Pratinjau UI)
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-slate-500 text-xs">Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text className="text-tallero-navy font-extrabold text-xs underline">
                Daftar di sini
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}