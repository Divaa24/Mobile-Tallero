import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api, { unwrapData } from "../services/api";

const SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
];

export default function BookingScreen({ navigation }: any) {
  const [services, setServices] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [bookingItem, setBookingItem] = useState<any | null>(null);
  const [selectedOutletId, setSelectedOutletId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [sRes, oRes, vRes] = await Promise.allSettled([
          api.get("/services"),
          api.get("/outlets"),
          api.get("/vehicles"),
        ]);

        if (sRes.status === "fulfilled") {
          const list = unwrapData(sRes.value);
          if (Array.isArray(list)) {
            setServices(
              list.map((s: any, idx: number) => ({
                ...s,
                rating: s.rating || "4.9",
                reviews: s.reviewsCount || 120,
                imageUrl: s.imageUrl || SERVICE_IMAGES[idx % SERVICE_IMAGES.length],
              }))
            );
          }
        }
        if (oRes.status === "fulfilled") {
          const list = unwrapData(oRes.value);
          if (Array.isArray(list) && list.length > 0) {
            setOutlets(list);
            setSelectedOutletId(list[0].id);
          }
        }
        if (vRes.status === "fulfilled") {
          const list = unwrapData(vRes.value);
          if (Array.isArray(list) && list.length > 0) {
            setVehicles(list);
            setSelectedVehicleId(list[0].id);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadMaster();
  }, []);

  const formatRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const toggleSave = (id: string) =>
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const confirmBooking = async () => {
    if (!bookingItem) return;
    if (!selectedVehicleId || !selectedOutletId) {
      Alert.alert(
        "Data Belum Lengkap",
        "Pastikan kendaraan sudah terdaftar di Profil dan cabang bengkel tersedia."
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/bookings", {
        vehicleId: selectedVehicleId,
        outletId: selectedOutletId,
        serviceIds: [bookingItem.id],
        scheduledAt: new Date().toISOString(),
      });

      const chosenName = bookingItem.name;
      setBookingItem(null);
      Alert.alert("Booking Berhasil", `${chosenName} pukul ${selectedTime} WIB tercatat.`, [
        { text: "Lihat Riwayat", onPress: () => navigation.navigate("History") },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Gagal Booking",
        err?.response?.data?.message || "Gagal menyimpan jadwal booking."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topIcon} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="chevron-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Layanan Populer</Text>
        <TouchableOpacity style={styles.topIcon} onPress={() => navigation.navigate("History")}>
          <Ionicons name="notifications-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listScroll}>
        {loading ? (
          <ActivityIndicator size="large" color="#1D4ED8" style={{ marginVertical: 30 }} />
        ) : services.length === 0 ? (
          <Text style={styles.outletText}>Belum ada data layanan dari server.</Text>
        ) : (
          services.map((srv) => {
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
                  <Text style={styles.outletText}>
                    {outlets[0]?.name || "Tallero Auto Center"}
                  </Text>
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
          })
        )}
      </ScrollView>

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

              <Text style={styles.outletText}>Pilih Kendaraan</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {vehicles.length === 0 ? (
                  <TouchableOpacity
                    style={styles.pill}
                    onPress={() => {
                      setBookingItem(null);
                      navigation.navigate("Profile");
                    }}
                  >
                    <Text style={styles.pillText}>+ Tambah Kendaraan di Profil</Text>
                  </TouchableOpacity>
                ) : (
                  vehicles.map((v) => {
                    const active = v.id === selectedVehicleId;
                    return (
                      <TouchableOpacity
                        key={v.id}
                        style={[styles.pill, active && styles.pillActive]}
                        onPress={() => setSelectedVehicleId(v.id)}
                      >
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>
                          {v.brand} ({v.licensePlate})
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              <Text style={styles.outletText}>Pilih Cabang Bengkel</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
                {outlets.map((o) => {
                  const active = o.id === selectedOutletId;
                  return (
                    <TouchableOpacity
                      key={o.id}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setSelectedOutletId(o.id)}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {o.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.outletText}>Pilih Jam Kedatangan</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}>
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

              <TouchableOpacity
                style={styles.bookBtn}
                disabled={submitting}
                onPress={confirmBooking}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.bookBtnText}>
                    Konfirmasi Booking • {formatRp(bookingItem.price)}
                  </Text>
                )}
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
  listScroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 30 },
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
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  bookBtn: { backgroundColor: "#1D4ED8", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 6 },
  bookBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});