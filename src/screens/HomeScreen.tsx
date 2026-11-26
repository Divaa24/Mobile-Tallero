import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../types/navigation";
import {
  MOCK_USER,
  MOCK_VEHICLES,
  MOCK_BOOKINGS,
  MOCK_SERVICES,
  MOCK_OUTLETS,
  STATUS_CONFIG,
  formatRupiah,
} from "../constants/mockData";

type HomeScreenProps = {
  navigation: BottomTabNavigationProp<MainTabParamList, "Home">;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const primaryVehicle = MOCK_VEHICLES[0];
  const activeBooking = MOCK_BOOKINGS.find(
    (b) => b.status !== "COMPLETED" && b.status !== "CANCELLED"
  );

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Gradasi Tallero */}
        <LinearGradient
          colors={["#012436", "#013C58", "#00537A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 52,
            paddingBottom: 32,
            paddingHorizontal: 22,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          {/* Baris Atas: Sapaan & Notifikasi */}
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-tallero-sky text-xs font-medium">
                Selamat Datang Kembali,
              </Text>
              <Text className="text-white text-xl font-extrabold mt-0.5">
                {MOCK_USER.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              className="w-10 h-10 rounded-full bg-white/15 items-center justify-center"
            >
              <FontAwesome6 name="car-side" size={16} color="#F5A201" />
            </TouchableOpacity>
          </View>

          {/* Kartu Kendaraan Utama (Model Vehicle) */}
          {primaryVehicle && (
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              activeOpacity={0.85}
              className="bg-white/10 border border-white/15 rounded-2xl p-3.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-tallero-amber items-center justify-center mr-3">
                  <FontAwesome6
                    name={primaryVehicle.type === "Motorcycle" ? "motorcycle" : "car"}
                    size={18}
                    color="#012436"
                  />
                </View>
                <View>
                  <Text className="text-white font-bold text-sm">
                    {primaryVehicle.brand} {primaryVehicle.model}
                  </Text>
                  <Text className="text-tallero-sky text-xs mt-0.5">
                    {primaryVehicle.licensePlate} • Tahun {primaryVehicle.year}
                  </Text>
                </View>
              </View>
              <View className="bg-white/15 px-2.5 py-1 rounded-lg">
                <Text className="text-white text-[11px] font-semibold">
                  {MOCK_VEHICLES.length} Unit
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Konten Utama */}
        <View className="px-5 pt-5 pb-10">
          {/* Status Booking Aktif (Model Booking + BookingStatus) */}
          {activeBooking && (
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-5">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-tallero-teal text-[11px] font-extrabold">
                  {activeBooking.bookingCode}
                </Text>
                <View
                  className={`px-2.5 py-1 rounded-full ${
                    STATUS_CONFIG[activeBooking.status].bg
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      STATUS_CONFIG[activeBooking.status].text
                    }`}
                  >
                    {STATUS_CONFIG[activeBooking.status].label}
                  </Text>
                </View>
              </View>

              <Text className="text-tallero-navy font-extrabold text-sm">
                {activeBooking.service?.name}
              </Text>
              <Text className="text-slate-500 text-xs mt-0.5 mb-3">
                {activeBooking.outlet?.name} •{" "}
                {activeBooking.vehicle?.licensePlate}
              </Text>

              {/* Progress Bar 5 Tahap Sesuai Enum BookingStatus */}
              <View className="flex-row items-center gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((step) => {
                  const currentStep = STATUS_CONFIG[activeBooking.status].step;
                  const isDone = step < currentStep;
                  const isCurrent = step === currentStep;
                  return (
                    <View
                      key={step}
                      className={`flex-1 h-1.5 rounded-full ${
                        isCurrent
                          ? "bg-tallero-amber"
                          : isDone
                          ? "bg-tallero-navy"
                          : "bg-slate-200"
                      }`}
                    />
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate("History")}
                className="flex-row items-center justify-between pt-2 border-t border-slate-100"
              >
                <Text className="text-tallero-teal text-xs font-bold">
                  Pantau Log & Mekanik ({activeBooking.mechanic?.name || "Menunggu"})
                </Text>
                <FontAwesome6 name="chevron-right" size={11} color="#00537A" />
              </TouchableOpacity>
            </View>
          )}

          {/* Banner CTA Booking Cepat */}
          <View className="bg-tallero-navy rounded-2xl p-4 mb-6 flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-tallero-amber text-[11px] font-extrabold uppercase tracking-wider">
                Booking Online
              </Text>
              <Text className="text-white text-base font-extrabold mt-0.5">
                Jadwalkan Servis Tanpa Antre
              </Text>
              <Text className="text-tallero-sky text-xs mt-1">
                Pilih kendaraan, paket layanan, outlet, & metode bayar.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("Booking")}
              activeOpacity={0.85}
              className="bg-tallero-amber px-4 py-3 rounded-xl"
            >
              <Text className="text-tallero-dark text-xs font-extrabold">
                Booking
              </Text>
            </TouchableOpacity>
          </View>

          {/* Daftar Paket Layanan (Model Service + Category) */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-tallero-navy text-base font-extrabold">
              Daftar Layanan Servis
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Booking")}>
              <Text className="text-tallero-teal text-xs font-bold">
                Lihat Semua
              </Text>
            </TouchableOpacity>
          </View>

          {MOCK_SERVICES.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-1">
                <View className="bg-sky-50 px-2.5 py-0.5 rounded-md">
                  <Text className="text-[11px] font-bold text-tallero-teal">
                    {item.category?.name}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <FontAwesome6 name="clock" size={11} color="#94a3b8" />
                  <Text className="text-[11px] text-slate-400">
                    ± {item.estimatedTime} Menit
                  </Text>
                </View>
              </View>

              <Text className="text-tallero-navy font-extrabold text-sm mt-1">
                {item.name}
              </Text>

              <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                <Text className="text-tallero-navy font-extrabold text-sm">
                  {formatRupiah(item.price)}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Booking", { selectedServiceId: item.id })
                  }
                  className="bg-tallero-navy px-3.5 py-1.5 rounded-lg"
                >
                  <Text className="text-white text-xs font-bold">
                    Booking Layanan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Outlet Bengkel (Model Outlet) */}
          <Text className="text-tallero-navy text-base font-extrabold mt-4 mb-3">
            Outlet Bengkel Tallero
          </Text>

          {MOCK_OUTLETS.filter((o) => o.isActive).map((outlet) => (
            <View
              key={outlet.id}
              className="bg-white rounded-2xl p-4 mb-2.5 border border-slate-100 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1 pr-2">
                <View className="w-9 h-9 rounded-full bg-amber-50 items-center justify-center mr-3">
                  <FontAwesome6 name="location-dot" size={15} color="#F5A201" />
                </View>
                <View className="flex-1">
                  <Text className="text-tallero-navy font-bold text-sm">
                    {outlet.name}
                  </Text>
                  <Text className="text-slate-500 text-xs mt-0.5">
                    {outlet.address}
                  </Text>
                </View>
              </View>

              <View className="bg-emerald-50 px-2.5 py-1 rounded-full">
                <Text className="text-emerald-700 text-[10px] font-bold">
                  Aktif
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}