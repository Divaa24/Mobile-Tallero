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
  Image,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import api, { unwrapData } from "../services/api";

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
      const token = payload?.token || payload?.accessToken || res?.data?.token;
      const user = payload?.user || payload;

      if (token) await AsyncStorage.setItem("tallero_token", token);
      if (user) await AsyncStorage.setItem("tallero_user", JSON.stringify(user));

      navigation.replace("MainApp");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Email atau kata sandi salah, atau server backend belum aktif.";
      Alert.alert("Gagal Masuk", msg);
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
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/tallero.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>TALLERO</Text>
          </View>

          <View style={styles.taglinePill}>
            <Text style={styles.taglineText}>SMART WORKSHOP & SERVICE</Text>
          </View>
        </LinearGradient>

        <View style={styles.bodyWrapper}>
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Selamat Datang</Text>
            <Text style={styles.welcomeSub}>
              Masuk untuk reservasi dan pantau progres servis kendaraanmu
            </Text>

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

            <Text style={styles.inputLabel}>Kata Sandi</Text>
            <View style={[styles.inputBox, { marginBottom: 24 }]}>
              <View style={styles.inputIconCircle}>
                <Ionicons name="lock-closed-outline" size={16} color="#1D4ED8" />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan kata sandi"
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
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.loginBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Belum punya akun pelanggan? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.footerLink}>Daftar Sekarang</Text>
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
    paddingTop: Platform.OS === "ios" ? 64 : 48,
    paddingBottom: 76,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    alignItems: "center",
  },
  logoWrapper: { alignItems: "center" },
  logoImage: { width: 76, height: 76, borderRadius: 20, marginBottom: 12 },
  brandName: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", letterSpacing: 5 },
  taglinePill: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  taglineText: { color: "#E0F2FE", fontSize: 10, fontWeight: "700", letterSpacing: 1.5 },
  bodyWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -44,
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  welcomeTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  welcomeSub: { fontSize: 12, color: "#64748B", marginTop: 4, marginBottom: 22, lineHeight: 18 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: "#1E293B", marginBottom: 8 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  inputIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: { flex: 1, marginLeft: 10, fontSize: 13, color: "#0F172A" },
  eyeBtn: { padding: 6 },
  loginBtn: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 },
  footerText: { fontSize: 12, color: "#64748B" },
  footerLink: { fontSize: 12, fontWeight: "700", color: "#1D4ED8" },
});