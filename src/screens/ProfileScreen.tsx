import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { CommonActions } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../types/navigation";
import { Vehicle } from "../types/models";
import { MOCK_USER, MOCK_VEHICLES } from "../constants/mockData";

type ProfileScreenProps = BottomTabScreenProps<MainTabParamList, "Profile">;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state sesuai tabel Vehicle Prisma
  const [licensePlate, setLicensePlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<"Car" | "Motorcycle">("Car");
  const [year, setYear] = useState("");

  const handleAddVehicle = () => {
    if (!licensePlate.trim() || !brand.trim() || !model.trim() || !year.trim()) {
      Alert.alert(
        "Data Belum Lengkap",
        "Isi plat nomor, merek, model, dan tahun kendaraan."
      );
      return;
    }

    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear) || parsedYear < 1980 || parsedYear > 2030) {
      Alert.alert("Tahun Tidak Valid", "Masukkan tahun kendaraan 4 digit.");
      return;
    }

    const newVehicle: Vehicle = {
      id: Date.now(),
      userId: MOCK_USER.id,
      licensePlate: licensePlate.trim().toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      type,
      year: parsedYear,
    };

    setVehicles((prev) => [...prev, newVehicle]);
    setLicensePlate("");
    setBrand("");
    setModel("");
    setYear("");
    setShowAddModal(false);
    Alert.alert("Berhasil", "Kendaraan baru ditambahkan ke garasi.");
  };

  const handleDeleteVehicle = (id: number) => {
    Alert.alert("Hapus Kendaraan", "Yakin ingin menghapus kendaraan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => setVehicles((prev) => prev.filter((v) => v.id !== id)),
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Keluar Akun", "Apakah kamu yakin ingin keluar dari Tallero?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: () => {
          navigation.getParent()?.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          );
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Gradasi Profil */}
        <LinearGradient
          colors={["#012436", "#013C58", "#00537A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 54,
            paddingBottom: 32,
            paddingHorizontal: 22,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            alignItems: "center",
          }}
        >
          <View className="w-20 h-20 rounded-full bg-tallero-amber items-center justify-center border-4 border-white/25 mb-3">
            <Text className="text-tallero-dark text-2xl font-extrabold">
              {MOCK_USER.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Text className="text-white text-xl font-extrabold">
              {MOCK_USER.name}
            </Text>
            {MOCK_USER.isVerified && (
              <FontAwesome6 name="circle-check" size={14} color="#F5A201" />
            )}
          </View>

          <Text className="text-tallero-sky text-xs mt-1">
            {MOCK_USER.email} • {MOCK_USER.phone}
          </Text>
        </LinearGradient>

        <View className="px-5 pt-5 pb-10">
          {/* Garasi Kendaraan Saya (Model Vehicle) */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-tallero-navy text-base font-extrabold">
              Kendaraan Saya ({vehicles.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="bg-tallero-navy px-3 py-1.5 rounded-xl flex-row items-center gap-1.5"
            >
              <FontAwesome6 name="plus" size={11} color="#F5A201" />
              <Text className="text-white text-xs font-bold">Tambah</Text>
            </TouchableOpacity>
          </View>

          {vehicles.map((v) => (
            <View
              key={v.id}
              className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-11 h-11 rounded-xl bg-sky-50 items-center justify-center mr-3.5">
                  <FontAwesome6
                    name={v.type === "Motorcycle" ? "motorcycle" : "car"}
                    size={18}
                    color="#013C58"
                  />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-tallero-navy font-extrabold text-sm">
                      {v.brand} {v.model}
                    </Text>
                  </View>
                  <Text className="text-slate-500 text-xs mt-0.5">
                    {v.licensePlate} • {v.type === "Car" ? "Mobil" : "Motor"} (
                    {v.year})
                  </Text>
                </View>
              </View>

              {vehicles.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleDeleteVehicle(v.id)}
                  className="p-2"
                >
                  <FontAwesome6 name="trash-can" size={14} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Informasi Akun (Model User) */}
          <Text className="text-tallero-navy text-base font-extrabold mt-4 mb-3">
            Informasi Akun
          </Text>

          <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6">
            <View className="pb-3 border-b border-slate-100">
              <Text className="text-slate-400 text-[11px]">Nomor Telepon</Text>
              <Text className="text-tallero-navy font-bold text-sm mt-0.5">
                {MOCK_USER.phone}
              </Text>
            </View>

            <View className="pt-3">
              <Text className="text-slate-400 text-[11px]">Alamat Lengkap</Text>
              <Text className="text-tallero-navy font-bold text-sm mt-0.5">
                {MOCK_USER.address || "Belum diatur"}
              </Text>
            </View>
          </View>

          {/* Tombol Keluar */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            className="bg-rose-50 border border-rose-200 py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
          >
            <FontAwesome6
              name="right-from-bracket"
              size={14}
              color="#e11d48"
            />
            <Text className="text-rose-600 font-extrabold text-sm">
              Keluar dari Akun
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Tambah Kendaraan (Model Vehicle Prisma) */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-tallero-navy text-lg font-extrabold">
                Tambah Kendaraan Baru
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <FontAwesome6 name="xmark" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Jenis Kendaraan */}
            <Text className="text-tallero-navy text-xs font-bold mb-1.5">
              Jenis Kendaraan
            </Text>
            <View className="flex-row gap-2 mb-3">
              {(["Car", "Motorcycle"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl border flex-row items-center justify-center gap-2 ${
                    type === t
                      ? "bg-tallero-navy border-tallero-navy"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <FontAwesome6
                    name={t === "Car" ? "car" : "motorcycle"}
                    size={13}
                    color={type === t ? "#F5A201" : "#64748b"}
                  />
                  <Text
                    className={`text-xs font-bold ${
                      type === t ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {t === "Car" ? "Mobil" : "Motor"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Plat Nomor */}
            <Text className="text-tallero-navy text-xs font-bold mb-1">
              Nomor Polisi (Plat)
            </Text>
            <TextInput
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="Contoh: B 2468 XYZ"
              autoCapitalize="characters"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-3"
            />

            {/* Merek & Model */}
            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <Text className="text-tallero-navy text-xs font-bold mb-1">
                  Merek
                </Text>
                <TextInput
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Toyota / Honda"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800"
                />
              </View>
              <View className="flex-1">
                <Text className="text-tallero-navy text-xs font-bold mb-1">
                  Model / Tipe
                </Text>
                <TextInput
                  value={model}
                  onChangeText={setModel}
                  placeholder="Avanza / Vario"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800"
                />
              </View>
            </View>

            {/* Tahun */}
            <Text className="text-tallero-navy text-xs font-bold mb-1">
              Tahun Pembuatan
            </Text>
            <TextInput
              value={year}
              onChangeText={setYear}
              placeholder="2023"
              keyboardType="number-pad"
              maxLength={4}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 mb-5"
            />

            <TouchableOpacity
              onPress={handleAddVehicle}
              className="bg-tallero-amber py-3.5 rounded-xl items-center"
            >
              <Text className="text-tallero-dark text-sm font-extrabold">
                Simpan Kendaraan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}