import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

const FILTER_TABS = [
  { id: "all", label: "Semua" },
  { id: "cat-1", label: "Berkala" },
  { id: "cat-2", label: "Ganti Oli" },
  { id: "cat-6", label: "AC Mobil" },
  { id: "cat-5", label: "Ban & Rem" },
];

const ALL_SERVICES = [
  {
    id: "srv-1",
    outlet: "Tallero Auto Center",
    name: "Servis Berkala 10K",
    price: 450000,
    rating: "4.9",
    reviews: 120,
    catId: "cat-1",
    imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "srv-2",
    outlet: "Tallero Auto Center",
    name: "Ganti Oli Full Synthetic",
    price: 385000,
    rating: "4.8",
    reviews: 98,
    catId: "cat-2",
    imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "srv-3",
    outlet: "Tallero Express",
    name: "Servis & Flushing AC",
    price: 320000,
    rating: "4.9",
    reviews: 84,
    catId: "cat-6",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "srv-4",
    outlet: "Tallero Flagship",
    name: "Spooring & Balancing 3D",
    price: 250000,
    rating: "4.7",
    reviews: 65,
    catId: "cat-5",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "srv-5",
    outlet: "Tallero Auto Center",
    name: "Tune Up & Gurah Mesin",
    price: 410000,
    rating: "4.9",
    reviews: 112,
    catId: "cat-1",
    imageUrl: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=600&q=80",
  },
];

export default function BookingScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState("all");
  const [savedIds, setSavedIds] = useState<string[]>(["srv-1", "srv-3"]);
  const [bookingItem, setBookingItem] = useState<(typeof ALL_SERVICES)[0] | null>(null);
  const [selectedTime, setSelectedTime] = useState("10:00");

  const formatRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const toggleSave = (id: string) =>
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const list = ALL_SERVICES.filter((s) => activeTab === "all" || s.catId === activeTab);

  const confirmBooking = async () => {
    if (!bookingItem) return;
    try {
      await api.post("/bookings", {
        vehicleId: "veh-1",
        outletId: "outlet-1",
        serviceIds: [bookingItem.id],
        scheduledAt: new Date().toISOString(),
      });
    } catch {}

    const chosen = bookingItem.name;
    setBookingItem(null);
    Alert.alert("Booking Berhasil", `${chosen} pukul ${selectedTime} WIB tercatat.`, [
      { text: "Lihat Riwayat", onPress: () => navigation.navigate("History") },
    ]);
  };

  return (
    <View style={styles.screen}>
      {/* Top Bar Putih Bersih (Persis Layar Tengah Referensi) */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topIcon} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="chevron-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Layanan Populer</Text>
        <TouchableOpacity style={styles.topIcon} onPress={() => navigation.navigate("History")}>
          <Ionicons name="notifications-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTER_TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setActiveTab(t.id)}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Daftar Kartu Layanan */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listScroll}>
        {list.map((srv) => {
          const bookmarked = savedIds.includes(srv.id);
          return (
            <TouchableOpacity
              key={srv.id}
              style={styles.card}
              onPress={() => setBookingItem(srv)}
              activeOpacity={0.88}
            >
              <Image source={{ uri: srv.imageUrl }} style={styles.thumb} resizeMode="cover" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.outletText}>{srv.outlet}</Text>
                <Text style={styles.titleText} numberOfLines={1}>
                  {srv.name}
                </Text>
                <Text style={styles.priceText}>{formatRp(srv.price)}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {srv.rating} ({srv.reviews} Ulasan)
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => toggleSave(srv.id)} style={{ alignSelf: "flex-start" }}>
                <Ionicons
                  name={bookmarked ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color={bookmarked ? "#1D4ED8" : "#94A3B8"}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Sheet Konfirmasi Jam Booking */}
      <Modal
        visible={!!bookingItem}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingItem(null)}
      >
        {bookingItem && (
          <View style={styles.modalOverlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.topTitle}>{bookingItem.name}</Text>
                <TouchableOpacity onPress={() => setBookingItem(null)}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.outletText}>Pilih Jam Kedatangan ({bookingItem.outlet})</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 14 }}>
                {["09:00", "10:00", "13:30", "15:30"].map((jam) => {
                  const active = jam === selectedTime;
                  return (
                    <TouchableOpacity
                      key={jam}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setSelectedTime(jam)}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {jam} WIB
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity style={styles.bookBtn} onPress={confirmBooking}>
                <Text style={styles.bookBtnText}>
                  Konfirmasi Booking • {formatRp(bookingItem.price)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
    marginBottom: 8,
  },
  pillActive: { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
  pillText: { fontSize: 12, fontWeight: "500", color: "#64748B" },
  pillTextActive: { color: "#FFFFFF", fontWeight: "600" },
  listScroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 30 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  thumb: { width: 80, height: 80, borderRadius: 14, backgroundColor: "#EFF6FF" },
  outletText: { fontSize: 11, color: "#94A3B8" },
  titleText: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginTop: 2 },
  priceText: { fontSize: 13, fontWeight: "700", color: "#1D4ED8", marginTop: 3 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 11, color: "#64748B", marginLeft: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  bookBtn: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  bookBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});