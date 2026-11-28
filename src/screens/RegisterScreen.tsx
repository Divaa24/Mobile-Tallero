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
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import api, { unwrapData } from "../services/api";

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

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert(
        "Data Belum Lengkap",
        "Nama lengkap, nomor WhatsApp, email, dan kata sandi wajib diisi."
      );
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        password,
      });

      const payload = unwrapData(res);
      const token = payload?.token || payload?.accessToken || res?.data?.token;
      const user = payload?.user || {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      if (token) await AsyncStorage.setItem("tallero_token", token);
      await AsyncStorage.setItem("tallero_user", JSON.stringify(user));

      Alert.alert("Registrasi Berhasil", "Akun berhasil dibuat!", [
        {
          text: "Lanjut",
          onPress: () =>
            token
              ? navigation.replace("MainApp")
              : navigation.replace("Login"),
        },
      ]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Registrasi gagal. Periksa kembali data atau koneksi backend.";
      Alert.alert("Gagal Daftar", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={["#0F2942", "#1D4ED8", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>REGISTRASI PELANGGAN</Text>
          </View>

          <Text style={styles.headerTitle}>Buat Akun Baru</Text>
          <Text style={styles.headerSub}>
            Daftar sekarang untuk booking servis tanpa antre
          </Text>
        </LinearGradient>

        <View style={styles.bodyWrapper}>
          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <View style={styles.inputBox}>
              <View style={styles.inputIconCircle}>
                <Ionicons name="person-outline" size={16} color="#1D4ED8" />
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Contoh: Budi Santoso"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
              />
            </View>

            <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
            <View style={styles.inputBox}>
              <View style={styles.inputIconCircle}>
                <Ionicons name="call-outline" size={16} color="#1D4ED8" />
              </View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="0812xxxxxxxx"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                style={styles.textInput}
              />
            </View>

            <Text style={styles.inputLabel}>Alamat Email</Text>
            <View style={styles.inputBox}>
              <View style={styles.inputIconCircle}>
                <Ionicons name="mail-outline" size={16} color="#1D4ED8" />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="nama@email.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>

            <Text style={styles.inputLabel}>Alamat (Opsional)</Text>
            <View style={styles.inputBox}>
              <View style={styles.inputIconCircle}>
                <Ionicons name="location-outline" size={16} color="#1D4ED8" />
              </View>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Kota atau alamat domisili"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
              />
            </View>

            <Text style={styles.inputLabel}>Kata Sandi</Text>
            <View style={[styles.inputBox, { marginBottom: 24 }]}>
              <View style={styles.inputIconCircle}>
                <Ionicons name="lock-closed-outline" size={16} color="#1D4ED8" />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Daftar Akun Tallero</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { flexGrow: 1 },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 56 : 38,
    paddingBottom: 68,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  badgePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  badgeText: { color: "#E0F2FE", fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#DBEAFE", fontSize: 12, marginTop: 4 },
  bodyWrapper: { flex: 1, paddingHorizontal: 20, marginTop: -40, paddingBottom: 32 },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  inputLabel: { fontSize: 12, fontWeight: "600", color: "#1E293B", marginBottom: 7 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 14,
  },
  inputIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: { flex: 1, marginLeft: 10, fontSize: 13, color: "#0F172A" },
  eyeBtn: { padding: 6 },
  submitBtn: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 22 },
  footerText: { fontSize: 12, color: "#64748B" },
  footerLink: { fontSize: 12, fontWeight: "700", color: "#1D4ED8" },
});