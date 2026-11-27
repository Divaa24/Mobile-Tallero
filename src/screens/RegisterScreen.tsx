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
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import api, { unwrapData, getErrorMessage } from "../services/api";

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert(
        "Data Belum Lengkap",
        "Lengkapi nama, nomor HP, email, dan kata sandi."
      );
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        ...(address.trim() ? { address: address.trim() } : {}),
      });

      const payload = unwrapData(res);
      const token = payload?.token || res?.data?.token;

      if (token) {
        await AsyncStorage.setItem("tallero_token", token);
        if (payload?.user) {
          await AsyncStorage.setItem(
            "tallero_user",
            JSON.stringify(payload.user)
          );
        }
        navigation.replace("MainApp");
      } else {
        setShowOtpModal(true);
      }
    } catch (error) {
      Alert.alert("Pendaftaran Gagal", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length !== 6) {
      Alert.alert(
        "Kode OTP Tidak Valid",
        "Masukkan 6 digit kode OTP dari email kamu."
      );
      return;
    }

    try {
      setVerifyingOtp(true);
      const res = await api.post("/auth/verify-otp", {
        email: email.trim(),
        otpCode: otpCode.trim(),
      });

      const payload = unwrapData(res);
      const token = payload?.token || res?.data?.token;

      setShowOtpModal(false);

      if (token) {
        await AsyncStorage.setItem("tallero_token", token);
        navigation.replace("MainApp");
      } else {
        Alert.alert("Verifikasi Berhasil", "Akun kamu aktif, silakan login.", [
          { text: "Login", onPress: () => navigation.replace("Login") },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Verifikasi Gagal",
        getErrorMessage(error, "Kode OTP salah atau kedaluwarsa.")
      );
    } finally {
      setVerifyingOtp(false);
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
        <LinearGradient
          colors={["#011C2B", "#013C58", "#00537A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 50,
            paddingBottom: 56,
            paddingHorizontal: 24,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-2xl bg-white/15 items-center justify-center mb-4"
          >
            <FontAwesome6 name="arrow-left" size={14} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="text-tallero-amber text-[11px] font-extrabold uppercase tracking-wider">
            Registrasi Pelanggan
          </Text>
          <Text className="text-white text-2xl font-extrabold mt-0.5">
            Buat Akun Baru
          </Text>
          <Text className="text-tallero-sky text-xs mt-1">
            Daftar sekarang untuk booking servis tanpa antre
          </Text>
        </LinearGradient>

        <View className="px-5 -mt-8 flex-1 justify-between pb-8">
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
            <Text className="text-tallero-navy text-xs font-bold mb-1.5">
              Nama Lengkap
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 mb-3.5">
              <View className="w-8 h-8 rounded-xl bg-sky-100/80 items-center justify-center">
                <FontAwesome6 name="user" size={13} color="#013C58" />
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Contoh: Budi Santoso"
                placeholderTextColor="#94a3b8"
                className="flex-1 ml-3 text-slate-800 text-sm"
              />
            </View>

            <Text className="text-tallero-navy text-xs font-bold mb-1.5">
              Nomor WhatsApp
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 mb-3.5">
              <View className="w-8 h-8 rounded-xl bg-sky-100/80 items-center justify-center">
                <FontAwesome6 name="phone" size={13} color="#013C58" />
              </View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="0812xxxxxxxx"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                className="flex-1 ml-3 text-slate-800 text-sm"
              />
            </View>

            <Text className="text-tallero-navy text-xs font-bold mb-1.5">
              Alamat Email
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 mb-3.5">
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

            <Text className="text-tallero-navy text-xs font-bold mb-1.5">
              Alamat (Opsional)
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 mb-3.5">
              <View className="w-8 h-8 rounded-xl bg-sky-100/80 items-center justify-center">
                <FontAwesome6 name="location-dot" size={13} color="#013C58" />
              </View>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Alamat tempat tinggal"
                placeholderTextColor="#94a3b8"
                className="flex-1 ml-3 text-slate-800 text-sm"
              />
            </View>

            <Text className="text-tallero-navy text-xs font-bold mb-1.5">
              Kata Sandi
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 mb-6">
              <View className="w-8 h-8 rounded-xl bg-sky-100/80 items-center justify-center">
                <FontAwesome6 name="lock" size={13} color="#013C58" />
              </View>
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
                className="p-1.5"
              >
                <FontAwesome6
                  name={showPassword ? "eye-slash" : "eye"}
                  size={14}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              className="bg-tallero-amber py-4 rounded-2xl items-center justify-center shadow-sm"
            >
              {loading ? (
                <ActivityIndicator color="#012436" size="small" />
              ) : (
                <Text className="text-tallero-dark font-extrabold text-sm">
                  Daftar Akun Tallero
                </Text>
              )}
            </TouchableOpacity>
          </View>

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

      {/* Modal Verifikasi OTP */}
      <Modal
        visible={showOtpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-white rounded-3xl p-6">
            <Text className="text-tallero-navy text-lg font-extrabold">
              Verifikasi Kode OTP
            </Text>
            <Text className="text-slate-500 text-xs mt-1 mb-4">
              Masukkan 6 digit kode OTP yang dikirim ke {email}
            </Text>

            <TextInput
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-center text-xl font-extrabold tracking-[8px] text-tallero-navy mb-4"
            />

            <TouchableOpacity
              onPress={handleVerifyOtp}
              disabled={verifyingOtp}
              className="bg-tallero-navy py-3.5 rounded-xl items-center"
            >
              {verifyingOtp ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white text-sm font-extrabold">
                  Verifikasi Akun
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}