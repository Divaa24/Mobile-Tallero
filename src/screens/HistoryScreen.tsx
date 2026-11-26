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
import { Booking } from "../types/models";
import {
  MOCK_BOOKINGS,
  STATUS_CONFIG,
  formatRupiah,
} from "../constants/mockData";

const formatTanggal = (isoString: string) => {
  const date = new Date(isoString);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} • ${hours}:${mins} WIB`;
};

export default function HistoryScreen() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "DONE">("ACTIVE");
  const [expandedId, setExpandedId] = useState<number | null>(
    MOCK_BOOKINGS[0]?.id ?? null
  );

  // State Modal Ulasan (Model Review)
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(
    null
  );
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  const filteredBookings = bookings.filter((b) =>
    activeTab === "ACTIVE"
      ? b.status !== "COMPLETED" && b.status !== "CANCELLED"
      : b.status === "COMPLETED" || b.status === "CANCELLED"
  );

  const handleSubmitReview = () => {
    if (!reviewModalBooking) return;

    setBookings((prev) =>
      prev.map((item) =>
        item.id === reviewModalBooking.id
          ? {
              ...item,
              review: {
                id: Date.now(),
                bookingId: item.id,
                userId: item.userId,
                rating,
                comment: comment.trim() || "Pelayanan sangat memuaskan!",
                createdAt: new Date().toISOString(),
              },
            }
          : item
      )
    );

    setReviewModalBooking(null);
    setRating(5);
    setComment("");
    Alert.alert("Terima Kasih!", "Ulasan servis kamu berhasil dikirim.");
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="light" />

      {/* Header Gradasi Tallero */}
      <LinearGradient
        colors={["#012436", "#013C58", "#00537A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 52,
          paddingBottom: 24,
          paddingHorizontal: 22,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <Text className="text-tallero-amber text-[11px] font-extrabold uppercase tracking-wider">
          Pantau Servis
        </Text>
        <Text className="text-white text-2xl font-extrabold mt-0.5">
          Riwayat & Status Booking
        </Text>

        {/* Segmented Filter Tab */}
        <View className="flex-row bg-white/10 p-1 rounded-2xl mt-4">
          <TouchableOpacity
            onPress={() => setActiveTab("ACTIVE")}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === "ACTIVE" ? "bg-tallero-amber" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-extrabold ${
                activeTab === "ACTIVE" ? "text-tallero-dark" : "text-white"
              }`}
            >
              Sedang Berjalan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("DONE")}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              activeTab === "DONE" ? "bg-tallero-amber" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-extrabold ${
                activeTab === "DONE" ? "text-tallero-dark" : "text-white"
              }`}
            >
              Selesai / Riwayat
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Daftar Booking */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {filteredBookings.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center border border-slate-100 mt-4">
            <FontAwesome6 name="clipboard-list" size={32} color="#94a3b8" />
            <Text className="text-tallero-navy font-extrabold text-base mt-3">
              Belum Ada Data Booking
            </Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Semua transaksi servis kendaraanmu akan tampil di sini.
            </Text>
          </View>
        ) : (
          filteredBookings.map((item) => {
            const statusStyle = STATUS_CONFIG[item.status];
            const isExpanded = expandedId === item.id;

            return (
              <View
                key={item.id}
                className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm"
              >
                {/* Baris Kode Booking & Badge Status */}
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-tallero-teal text-xs font-extrabold">
                    {item.bookingCode}
                  </Text>
                  <View className={`px-2.5 py-1 rounded-full ${statusStyle.bg}`}>
                    <Text className={`text-[10px] font-bold ${statusStyle.text}`}>
                      {statusStyle.label}
                    </Text>
                  </View>
                </View>

                {/* Nama Layanan & Kendaraan */}
                <Text className="text-tallero-navy font-extrabold text-base">
                  {item.service?.name}
                </Text>
                <Text className="text-slate-500 text-xs mt-1">
                  {item.outlet?.name}
                </Text>

                <View className="flex-row items-center gap-2 mt-2">
                  <View className="bg-slate-100 px-2.5 py-1 rounded-lg flex-row items-center gap-1.5">
                    <FontAwesome6
                      name={
                        item.vehicle?.type === "Motorcycle"
                          ? "motorcycle"
                          : "car"
                      }
                      size={11}
                      color="#013C58"
                    />
                    <Text className="text-tallero-navy text-[11px] font-bold">
                      {item.vehicle?.brand} {item.vehicle?.model} (
                      {item.vehicle?.licensePlate})
                    </Text>
                  </View>
                </View>

                {/* Jadwal & Total Biaya + Status Bayar */}
                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <View>
                    <Text className="text-slate-400 text-[10px]">
                      Jadwal Servis
                    </Text>
                    <Text className="text-slate-700 text-xs font-semibold mt-0.5">
                      {formatTanggal(item.bookingDate)}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-tallero-navy font-extrabold text-sm">
                      {formatRupiah(item.totalPrice ?? item.service?.price ?? 0)}
                    </Text>
                    <Text
                      className={`text-[10px] font-bold mt-0.5 ${
                        item.paymentStatus === "PAID"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {item.paymentMethod} •{" "}
                      {item.paymentStatus === "PAID" ? "LUNAS" : "BELUM BAYAR"}
                    </Text>
                  </View>
                </View>

                {/* Detail Log & Mekanik (Expandable) */}
                {isExpanded && (
                  <View className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/80 rounded-xl p-3">
                    <Text className="text-tallero-navy text-xs font-extrabold mb-1">
                      Mekanik Bertugas:{" "}
                      <Text className="font-semibold text-slate-700">
                        {item.mechanic?.name ?? "Menunggu penugasan"}
                      </Text>
                    </Text>

                    {item.customerNotes ? (
                      <Text className="text-slate-500 text-xs mb-2">
                        Keluhan: "{item.customerNotes}"
                      </Text>
                    ) : null}

                    {item.adminNotes ? (
                      <Text className="text-tallero-teal text-xs font-medium mb-2">
                        Catatan Bengkel: {item.adminNotes}
                      </Text>
                    ) : null}

                    {/* Timeline BookingLog */}
                    {item.statusLogs && item.statusLogs.length > 0 && (
                      <View className="mt-2">
                        <Text className="text-tallero-navy text-[11px] font-extrabold uppercase mb-2">
                          Riwayat Progres (Log)
                        </Text>
                        {item.statusLogs.map((log) => (
                          <View
                            key={log.id}
                            className="flex-row items-start mb-2 pl-2 border-l-2 border-tallero-amber"
                          >
                            <View className="flex-1">
                              <Text className="text-tallero-navy text-xs font-bold">
                                {STATUS_CONFIG[log.status].label}
                              </Text>
                              {log.notes && (
                                <Text className="text-slate-500 text-[11px]">
                                  {log.notes}
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Tombol Toggle Detail & Tombol Ulasan */}
                <View className="flex-row items-center justify-between mt-3 pt-2">
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedId(isExpanded ? null : item.id)
                    }
                    className="flex-row items-center gap-1.5"
                  >
                    <Text className="text-tallero-teal text-xs font-bold">
                      {isExpanded ? "Sembunyikan Detail" : "Lihat Log & Detail"}
                    </Text>
                    <FontAwesome6
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={10}
                      color="#00537A"
                    />
                  </TouchableOpacity>

                  {/* Tombol Review jika status COMPLETED */}
                  {item.status === "COMPLETED" && !item.review && (
                    <TouchableOpacity
                      onPress={() => setReviewModalBooking(item)}
                      className="bg-tallero-amber px-3.5 py-1.5 rounded-lg flex-row items-center gap-1.5"
                    >
                      <FontAwesome6 name="star" size={11} color="#012436" />
                      <Text className="text-tallero-dark text-xs font-extrabold">
                        Beri Ulasan
                      </Text>
                    </TouchableOpacity>
                  )}

                  {item.review && (
                    <View className="flex-row items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <FontAwesome6
                        name="star"
                        solid
                        size={11}
                        color="#F5A201"
                      />
                      <Text className="text-tallero-navy text-xs font-extrabold">
                        {item.review.rating}.0 / 5
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal Beri Ulasan (Model Review Prisma) */}
      <Modal
        visible={!!reviewModalBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalBooking(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-tallero-navy text-lg font-extrabold">
                Ulasan Hasil Servis
              </Text>
              <TouchableOpacity onPress={() => setReviewModalBooking(null)}>
                <FontAwesome6 name="xmark" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-500 text-xs mb-4">
              {reviewModalBooking?.service?.name} •{" "}
              {reviewModalBooking?.outlet?.name}
            </Text>

            {/* Pilihan Bintang 1-5 */}
            <View className="flex-row justify-center gap-3 my-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  className="p-2"
                >
                  <FontAwesome6
                    name="star"
                    solid={star <= rating}
                    size={28}
                    color={star <= rating ? "#F5A201" : "#cbd5e1"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-tallero-navy text-xs font-bold mb-1.5 mt-2">
              Komentar (Opsional)
            </Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Ceritakan pengalaman servis di bengkel Tallero..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 min-h-[76px] mb-5"
            />

            <TouchableOpacity
              onPress={handleSubmitReview}
              className="bg-tallero-navy py-3.5 rounded-xl items-center"
            >
              <Text className="text-white text-sm font-extrabold">
                Kirim Ulasan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}