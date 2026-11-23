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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Data Belum Lengkap", "Lengkapi semua kolom pendaftaran.");
      return;
    }
    Alert.alert("Pendaftaran Berhasil", "Akun Tallero kamu siap digunakan.", [
      { text: "Lanjut", onPress: () => navigation.replace("MainApp") },
    ]);
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
        {/* Header Gradasi */}
        <LinearGradient
          colors={["#012436", "#013C58", "#00537A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-14 pb-16 px-6 rounded-b-[36px]"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-white/15 items-center justify-center mb-4"
          >
            <FontAwesome6 name="arrow-left" size={14} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="text-white text-2xl font-extrabold">
            Buat Akun Baru
          </Text>
          <Text className="text-tallero-sky text-xs mt-1">
            Booking servis bengkel jadi lebih cepat tanpa antre
          </Text>
        </LinearGradient>

        {/* Kartu Form Register */}
        <View className="px-6 -mt-8 flex-1 justify-between pb-8">
          <View className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
            {/* Nama Lengkap */}
            <Text className="text-tallero-navy text-xs font-bold mb-1.5">
              Nama Lengkap
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3.5">
              <FontAwesome6 name="user" size={14} color="#00537A" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Contoh: Budi Santoso"
                placeholderTextColor="#94a3b8"
                className="flex-1 ml-3 text-slate-800 text-sm"
              />
            </View>

            {/* Nomor WhatsApp / HP */}
            <Text className="text-tallero-navy text-xs font-bold mb-1.5">
              Nomor WhatsApp
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3.5">
              <FontAwesome6 name="phone" size={14} color="#00537A" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="0812xxxxxxxx"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                className="flex-1 ml-3 text-slate-800 text-sm"
              />
            </View>

            {/* Email */}
            <Text className="text-tallero-navy text-xs font-bold mb-1.5">
              Email
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3.5">
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

            {/* Password */}
            <Text className="text-tallero-navy text-xs font-bold mb-1.5">
              Kata Sandi
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
              <FontAwesome6 name="lock" size={14} color="#00537A" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimal 6 karakter"
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

            {/* Tombol Daftar */}
            <TouchableOpacity
              onPress={handleRegister}
              activeOpacity={0.85}
              className="bg-tallero-amber py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-sm"
            >
              <Text className="text-tallero-dark font-extrabold text-sm">
                Daftar Akun Tallero
              </Text>
              <FontAwesome6 name="check" size={14} color="#012436" />
            </TouchableOpacity>
          </View>

          {/* Footer Kembali ke Login */}
          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-slate-500 text-xs">Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-tallero-navy font-extrabold text-xs underline">
                Masuk
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}