import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../types/navigation";
import {
  Outlet,
  Vehicle,
  Service,
  Category,
  PaymentMethod,
} from "../types/models";
import api, { unwrapData, getErrorMessage } from "../services/api";
import {
  MOCK_OUTLETS,
  MOCK_VEHICLES,
  MOCK_SERVICES,
  formatRupiah,
} from "../constants/mockData";

type BookingScreenProps = BottomTabScreenProps<MainTabParamList, "Booking">;

const TIME_SLOTS = ["09:00", "10:30", "13:00", "14:30", "16:00"];

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  desc: string;
  icon: string;
}[] = [
  { value: "QRIS", label: "QRIS", desc: "Scan instan", icon: "qrcode" },
  {
    value: "TRANSFER",
    label: "Transfer",
    desc: "Virtual Account",
    icon: "building-columns",
  },
  {
    value: "CASH",
    label: "Tunai",
    desc: "Bayar di kasir",
    icon: "money-bill-wave",
  },
];

export default function BookingScreen({
  navigation,
  route,
}: BookingScreenProps) {
  const dateOptions = useMemo(() => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    return Array.from({ length: 6 }, (_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx + 1);
      const isoDate = d.toISOString().split("T")[0];
      return {
        isoDate,
        dayName: days[d.getDay()],
        dateLabel: `${d.getDate()} ${months[d.getMonth()]}`,
      };
    });
  }, []);

  const [outlets, setOutlets] = useState<Outlet[]>(MOCK_OUTLETS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);

  const [outletId, setOutletId] = useState<number>(MOCK_OUTLETS[0]?.id ?? 1);
  const [vehicleId, setVehicleId] = useState<number>(MOCK_VEHICLES[0]?.id ?? 1);
  const [categoryId, setCategoryId] = useState<number | "ALL">("ALL");
  const [serviceId, setServiceId] = useState<number>(
    route.params?.selectedServiceId ?? MOCK_SERVICES[0]?.id ?? 1
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    dateOptions[0]?.isoDate ?? ""
  );
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const token = await AsyncStorage.getItem("tallero_token");
          const [outRes, srvRes, vehRes] = await Promise.allSettled([
            api.get("/outlets"),
            api.get("/services"),
            token ? api.get("/vehicles/my") : Promise.reject("no-token"),
          ]);

          if (!active) return;

          if (outRes.status === "fulfilled") {
            const list = unwrapData<Outlet[]>(outRes.value);
            if (Array.isArray(list) && list.length > 0) {
              setOutlets(list);
              setOutletId((prev) =>
                list.some((o) => o.id === prev) ? prev : list[0].id
              );
            }
          }

          if (srvRes.status === "fulfilled") {
            const list = unwrapData<Service[]>(srvRes.value);
            if (Array.isArray(list) && list.length > 0) {
              setServices(list);
              if (!route.params?.selectedServiceId) {
                setServiceId((prev) =>
                  list.some((s) => s.id === prev) ? prev : list[0].id
                );
              }
            }
          }

          if (vehRes.status === "fulfilled") {
            const list = unwrapData<Vehicle[]>(vehRes.value);
            if (Array.isArray(list)) {
              setVehicles(list);
              if (list.length > 0) {
                setVehicleId((prev) =>
                  list.some((v) => v.id === prev) ? prev : list[0].id
                );
              }
            }
          }
        } catch {
          // Gunakan fallback
        }
      })();
      return () => {
        active = false;
      };
    }, [route.params?.selectedServiceId])
  );

  useEffect(() => {
    if (route.params?.selectedServiceId) {
      setServiceId(route.params.selectedServiceId);
      setCategoryId("ALL");
    }
  }, [route.params?.selectedServiceId]);

  const categories = useMemo<Category[]>(() => {
    const map = new Map<number, Category>();
    services.forEach((s) => {
      if (s.category) {
        map.set(s.category.id, s.category);
      }
    });
    return Array.from(map.values());
  }, [services]);

  const filteredServices = useMemo(() => {
    if (categoryId === "ALL") return services;
    return services.filter((s) => s.categoryId === categoryId);
  }, [categoryId, services]);

  const selectedOutlet = outlets.find((o) => o.id === outletId);
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const selectedService = services.find((s) => s.id === serviceId);

  const handleSubmitBooking = async () => {
    if (!selectedOutlet || !selectedVehicle || !selectedService) {
      Alert.alert(
        "Data Belum Lengkap",
        "Pastikan outlet, kendaraan, dan paket layanan sudah dipilih."
      );
      return;
    }

    const token = await AsyncStorage.getItem("tallero_token");
    if (!token) {
      Alert.alert(
        "Belum Login",
        "Silakan masuk akun terlebih dahulu untuk membuat booking asli ke server."
      );
      return;
    }

    try {
      setSubmitting(true);
      const isoBookingDate = new Date(
        `${selectedDate}T${selectedTime}:00`
      ).toISOString();

      const combinedNotes = [
        `[Preferensi Bayar: ${paymentMethod}]`,
        customerNotes.trim(),
      ]
        .filter(Boolean)
        .join(" ");

      const res = await api.post("/bookings", {
        outletId: Number(selectedOutlet.id),
        vehicleId: Number(selectedVehicle.id),
        serviceId: Number(selectedService.id),
        bookingDate: isoBookingDate,
        customerNotes: combinedNotes,
      });

      const created = unwrapData(res);
      const code = created?.bookingCode || "Berhasil Tercatat";

      setCustomerNotes("");
      Alert.alert(
        "Booking Berhasil!",
        `Kode Booking: ${code}\nOutlet: ${selectedOutlet.name}\nLayanan: ${selectedService.name}`,
        [
          {
            text: "Pantau di Riwayat",
            onPress: () => navigation.navigate("History"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Booking Gagal", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-slate-50"
    >
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={["#012436", "#013C58", "#00537A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 52,
            paddingBottom: 28,
            paddingHorizontal: 22,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text className="text-tallero-amber text-[11px] font-extrabold uppercase tracking-wider">
            Reservasi Bengkel
          </Text>
          <Text className="text-white text-2xl font-extrabold mt-0.5">
            Booking Servis Baru
          </Text>
          <Text className="text-tallero-sky text-xs mt-1">
            Lengkapi detail jadwal dan kendaraan untuk mendapatkan slot servis
          </Text>
        </LinearGradient>

        <View className="px-5 pt-5 pb-10">
          {/* 1. Pilih Outlet */}
          <Text className="text-tallero-navy text-sm font-extrabold mb-2.5">
            1. Pilih Outlet Bengkel
          </Text>
          {outlets
            .filter((o) => o.isActive)
            .map((outlet) => {
              const isSelected = outlet.id === outletId;
              return (
                <TouchableOpacity
                  key={outlet.id}
                  onPress={() => setOutletId(outlet.id)}
                  activeOpacity={0.85}
                  className={`rounded-2xl p-3.5 mb-2.5 border flex-row items-center justify-between ${
                    isSelected
                      ? "bg-sky-50/70 border-tallero-navy"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <View className="flex-row items-center flex-1 pr-3">
                    <View
                      className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
                        isSelected ? "bg-tallero-navy" : "bg-slate-100"
                      }`}
                    >
                      <FontAwesome6
                        name="location-dot"
                        size={15}
                        color={isSelected ? "#F5A201" : "#64748b"}
                      />
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

                  <View
                    className={`w-5 h-5 rounded-full items-center justify-center border ${
                      isSelected
                        ? "bg-tallero-navy border-tallero-navy"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <FontAwesome6 name="check" size={10} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

          {/* 2. Pilih Kendaraan */}
          <Text className="text-tallero-navy text-sm font-extrabold mt-4 mb-2.5">
            2. Pilih Kendaraan
          </Text>
          {vehicles.length === 0 ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              className="bg-amber-50 border border-tallero-amber rounded-2xl p-4 mb-2 flex-row items-center justify-between"
            >
              <Text className="text-tallero-navy text-xs font-bold flex-1 pr-2">
                Kamu belum memiliki kendaraan terdaftar. Klik untuk tambah di Profil.
              </Text>
              <FontAwesome6 name="plus" size={14} color="#013C58" />
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              {vehicles.map((vehicle) => {
                const isSelected = vehicle.id === vehicleId;
                return (
                  <TouchableOpacity
                    key={vehicle.id}
                    onPress={() => setVehicleId(vehicle.id)}
                    activeOpacity={0.85}
                    className={`w-44 mr-2.5 rounded-2xl p-3.5 border ${
                      isSelected
                        ? "bg-tallero-navy border-tallero-navy"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <FontAwesome6
                        name={
                          vehicle.type === "Motorcycle" ? "motorcycle" : "car"
                        }
                        size={16}
                        color={isSelected ? "#F5A201" : "#013C58"}
                      />
                      <Text
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isSelected
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {vehicle.licensePlate}
                      </Text>
                    </View>
                    <Text
                      numberOfLines={1}
                      className={`font-extrabold text-xs ${
                        isSelected ? "text-white" : "text-tallero-navy"
                      }`}
                    >
                      {vehicle.brand} {vehicle.model}
                    </Text>
                    <Text
                      className={`text-[11px] mt-0.5 ${
                        isSelected ? "text-tallero-sky" : "text-slate-400"
                      }`}
                    >
                      Tahun {vehicle.year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* 3. Pilih Kategori & Layanan */}
          <Text className="text-tallero-navy text-sm font-extrabold mt-4 mb-2.5">
            3. Pilih Paket Layanan
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            <TouchableOpacity
              onPress={() => setCategoryId("ALL")}
              className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                categoryId === "ALL"
                  ? "bg-tallero-navy border-tallero-navy"
                  : "bg-white border-slate-200"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  categoryId === "ALL" ? "text-white" : "text-slate-600"
                }`}
              >
                Semua
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const active = categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                    active
                      ? "bg-tallero-navy border-tallero-navy"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      active ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filteredServices.map((srv) => {
            const isSelected = srv.id === serviceId;
            return (
              <TouchableOpacity
                key={srv.id}
                onPress={() => setServiceId(srv.id)}
                activeOpacity={0.85}
                className={`rounded-2xl p-3.5 mb-2.5 border flex-row items-center justify-between ${
                  isSelected
                    ? "bg-amber-50/60 border-tallero-amber"
                    : "bg-white border-slate-200"
                }`}
              >
                <View className="flex-1 pr-3">
                  <Text className="text-[11px] font-bold text-tallero-teal">
                    {srv.category?.name ?? "Layanan"} • ± {srv.estimatedTime}{" "}
                    Menit
                  </Text>
                  <Text className="text-tallero-navy font-extrabold text-sm mt-0.5">
                    {srv.name}
                  </Text>
                  <Text className="text-tallero-navy font-bold text-xs mt-1">
                    {formatRupiah(srv.price)}
                  </Text>
                </View>

                <View
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    isSelected ? "bg-tallero-amber" : "bg-slate-100"
                  }`}
                >
                  <FontAwesome6
                    name="check"
                    size={11}
                    color={isSelected ? "#012436" : "#cbd5e1"}
                  />
                </View>
              </TouchableOpacity>
            );
          })}

          {/* 4. Pilih Tanggal & Jam */}
          <Text className="text-tallero-navy text-sm font-extrabold mt-4 mb-2.5">
            4. Tanggal & Jam Kedatangan
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {dateOptions.map((item) => {
              const active = item.isoDate === selectedDate;
              return (
                <TouchableOpacity
                  key={item.isoDate}
                  onPress={() => setSelectedDate(item.isoDate)}
                  className={`w-20 py-2.5 rounded-2xl mr-2 items-center border ${
                    active
                      ? "bg-tallero-navy border-tallero-navy"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-medium ${
                      active ? "text-tallero-sky" : "text-slate-400"
                    }`}
                  >
                    {item.dayName}
                  </Text>
                  <Text
                    className={`text-xs font-extrabold mt-0.5 ${
                      active ? "text-white" : "text-tallero-navy"
                    }`}
                  >
                    {item.dateLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className="flex-row flex-wrap gap-2 mb-2">
            {TIME_SLOTS.map((slot) => {
              const active = slot === selectedTime;
              return (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setSelectedTime(slot)}
                  className={`px-4 py-2 rounded-xl border ${
                    active
                      ? "bg-tallero-amber border-tallero-amber"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-extrabold ${
                      active ? "text-tallero-dark" : "text-slate-700"
                    }`}
                  >
                    {slot} WIB
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 5. Preferensi Pembayaran */}
          <Text className="text-tallero-navy text-sm font-extrabold mt-4 mb-2.5">
            5. Preferensi Pembayaran di Bengkel
          </Text>
          <View className="flex-row gap-2 mb-4">
            {PAYMENT_OPTIONS.map((opt) => {
              const active = opt.value === paymentMethod;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setPaymentMethod(opt.value)}
                  className={`flex-1 rounded-2xl p-3 items-center border ${
                    active
                      ? "bg-tallero-navy border-tallero-navy"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <FontAwesome6
                    name={opt.icon as any}
                    size={16}
                    color={active ? "#F5A201" : "#00537A"}
                  />
                  <Text
                    className={`text-xs font-extrabold mt-1.5 ${
                      active ? "text-white" : "text-tallero-navy"
                    }`}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    className={`text-[10px] mt-0.5 ${
                      active ? "text-tallero-sky" : "text-slate-400"
                    }`}
                  >
                    {opt.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 6. Catatan Keluhan */}
          <Text className="text-tallero-navy text-sm font-extrabold mb-2">
            6. Catatan Keluhan (Opsional)
          </Text>
          <View className="bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-6">
            <TextInput
              value={customerNotes}
              onChangeText={setCustomerNotes}
              placeholder="Contoh: Tarikan terasa berat atau bunyi di bagian rem depan..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="text-slate-800 text-xs min-h-[68px]"
            />
          </View>

          {/* Ringkasan & Tombol Konfirmasi */}
          <View className="bg-tallero-navy rounded-2xl p-4 shadow-md">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-tallero-sky text-xs">
                  Estimasi Total Biaya
                </Text>
                <Text className="text-white text-xl font-extrabold mt-0.5">
                  {selectedService ? formatRupiah(selectedService.price) : "Rp 0"}
                </Text>
              </View>
              <View className="bg-white/10 px-3 py-1.5 rounded-xl">
                <Text className="text-tallero-amber text-xs font-bold">
                  {paymentMethod}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmitBooking}
              disabled={submitting}
              activeOpacity={0.85}
              className="bg-tallero-amber py-3.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              {submitting ? (
                <ActivityIndicator color="#012436" size="small" />
              ) : (
                <>
                  <FontAwesome6 name="calendar-check" size={14} color="#012436" />
                  <Text className="text-tallero-dark text-sm font-extrabold">
                    Konfirmasi Booking Servis
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}