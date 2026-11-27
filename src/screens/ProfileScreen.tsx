import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { unwrapData } from "../services/api";

const DEFAULT_VEHICLES = [
  { id: "veh-1", brand: "Toyota", model: "Avanza Veloz", year: 2023, licensePlate: "B 1428 TLR" },
  { id: "veh-2", brand: "Honda", model: "PCX 160", year: 2024, licensePlate: "B 4812 KLM" },
];

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState({ name: "Pelanggan Tallero", email: "pelanggan@talleroauto.com" });
  const [vehicles, setVehicles] = useState(DEFAULT_VEHICLES);
  const [modalOpen, setModalOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("tallero_user").then((raw) => {
      if (raw) {
        const u = JSON.parse(raw);
        setUser((prev) => ({ name: u?.name || prev.name, email: u?.email || prev.email }));
      }
    });

    api.get("/vehicles")
      .then((res) => {
        const list = unwrapData(res);
        if (Array.isArray(list) && list.length > 0) setVehicles(list);
      })
      .catch(() => {});
  }, []);

  const addVehicle = async () => {
    if (!brand.trim() || !plate.trim()) return;
    const item = {
      id: "v-" + Date.now(),
      brand: brand.trim(),
      model: model.trim(),
      year: 2024,
      licensePlate: plate.trim().toUpperCase(),
    };
    try {
      await api.post("/vehicles", { ...item, type: "CAR" });
    } catch {}
    setVehicles((prev) => [item, ...prev]);
    setBrand("");
    setModel("");
    setPlate("");
    setModalOpen(false);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["tallero_token", "tallero_user"]);
    navigation.getParent()?.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={{ width: 36 }} />
        <Text style={styles.topTitle}>Profil Saya</Text>
        <TouchableOpacity style={styles.topIcon} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#1D4ED8" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Kartu User */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#1D4ED8" />
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        {/* Garasi Kendaraan */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Kendaraan Saya</Text>
          <TouchableOpacity onPress={() => setModalOpen(true)}>
            <Text style={styles.addText}>+ Tambah</Text>
          </TouchableOpacity>
        </View>

        {vehicles.map((v) => (
          <View key={v.id} style={styles.vehicleCard}>
            <View style={styles.vehicleIconBox}>
              <Ionicons name="car-outline" size={20} color="#1D4ED8" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.vehicleTitle}>
                {v.brand} {v.model}
              </Text>
              <Text style={styles.userEmail}>Tahun {v.year}</Text>
            </View>
            <View style={styles.platePill}>
              <Text style={styles.plateText}>{v.licensePlate}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Tambah Kendaraan</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <TextInput
              value={brand}
              onChangeText={setBrand}
              placeholder="Merek (contoh: Toyota)"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
            <TextInput
              value={model}
              onChangeText={setModel}
              placeholder="Model (contoh: Avanza Veloz)"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
            <TextInput
              value={plate}
              onChangeText={setPlate}
              placeholder="Nomor Polisi (contoh: B 1234 TLR)"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              style={styles.input}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={addVehicle}>
              <Text style={styles.saveBtnText}>Simpan Kendaraan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 24,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  topIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  scroll: { padding: 20, paddingBottom: 40 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  userEmail: { fontSize: 12, color: "#64748B", marginTop: 2 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  addText: { fontSize: 12, fontWeight: "600", color: "#1D4ED8" },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  vehicleIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  platePill: { backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  plateText: { fontSize: 11, fontWeight: "700", color: "#1D4ED8" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});