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
      Alert.alert(
        "Data Belum Lengkap",
        "Masukkan email dan kata sandi terlebih dahulu."
      );
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
      Alert.alert(
        "Login Gagal",
        getErrorMessage(error, "Email atau kata sandi salah.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-100"
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Gradasi */}
        <LinearGradient
          colors={["#011C2B", "#013C58", "#00537A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 56,
            paddingBottom: 74,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
            alignItems: "center",
          }}
        >
          {/* Badge Logo */}
          <View className="p-2 rounded-3xl bg-white/10 mb-3">
            <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center shadow-md">
              <FontAwesome6 name="gear" size={30} color="#013C58" />
              <View className="w-3.5 h-3.5 rounded-full bg-tallero-amber border-2 border-white absolute -top-1 -right-1" />
            </View>
          </View>

          <Text className="text-white text-2xl font-extrabold tracking-[5px]">
            TALLERO
          </Text>

          <View className="bg-tallero-amber/20 border border-tallero-amber/40 px-3 py-1 rounded-full mt-2">
            <Text className="text-tallero-amber text-[10px] font-extrabold tracking-widest uppercase">
              Smart Workshop & Service
            </Text>
          </View>
        </LinearGradient>

        {/* Kartu Form Mengambang */}
        <View className="px-5 -mt-11 flex-1 justify-between pb-8">
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
            <Text className="text-tallero-navy text-xl font-extrabold">
              Selamat Datang
            </Text>
            <Text className="text-slate-400 text-xs mt-1 mb-6">
              Masuk untuk reservasi dan pantau progres servis kendaraanmu
            </Text>

            {/* Input Email */}
            <Text className="text-tallero-navy text-xs font-bold mb-2">
              Alamat Email
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 mb-4">
              <View className="w-8 h-8 rounded-xl bg-sky-100/80 items-center justify-center">
                <FontAwesome6 name="envelope" size={13} color="#013C58" />
              </View>
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

            {/* Input Kata Sandi */}
            <Text className="text-tallero-navy text-xs font-bold mb-2">
              Kata Sandi
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 mb-6">
              <View className="w-8 h-8 rounded-xl bg-sky-100/80 items-center justify-center">
                <FontAwesome6 name="lock" size={13} color="#013C58" />
              </View>
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
                className="p-1.5"
              >
                <FontAwesome6
                  name={showPassword ? "eye-slash" : "eye"}
                  size={14}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Tombol Utama */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              className="bg-tallero-navy py-4 rounded-2xl items-center justify-center shadow-md"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white font-extrabold text-sm tracking-wide">
                  Masuk Sekarang
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Daftar */}
          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-slate-500 text-xs">
              Belum punya akun pelanggan?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text className="text-tallero-navy font-extrabold text-xs underline">
                Daftar Sekarang
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}