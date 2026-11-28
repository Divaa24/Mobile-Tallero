import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { unwrapData } from "../services/api";

interface OutletItem {
  id: string;
  name: string;
  city: string;
  address: string;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  categoryId?: string;
  rating?: string;
  reviewsCount?: number;
  imageUrl?: string;
}

interface VehicleItem {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
}

const SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
];

const CATEGORIES = [
  { id: "all", name: "Semua", icon: "apps-outline" as const },
  { id: "berkala", name: "Berkala", icon: "construct-outline" as const },
  { id: "oli", name: "Ganti Oli", icon: "water-outline" as const },
  { id: "listrik", name: "Kelistrikan", icon: "flash-outline" as const },
  { id: "cuci", name: "Cuci & Salon", icon: "sparkles-outline" as const },
  { id: "rem", name: "Rem & Kaki", icon: "disc-outline" as const },
  { id: "ac", name: "AC Mobil", icon: "snow-outline" as const },
  { id: "tuneup", name: "Tune Up", icon: "speedometer-outline" as const },
];

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState("Pelanggan Tallero");
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [activeOutlet, setActiveOutlet] = useState<OutletItem | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const [detailService, setDetailService] = useState<ServiceItem | null>(null);
  const [outletModal, setOutletModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const rawUser = await AsyncStorage.getItem("tallero_user");
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u?.name) setUserName(u.name);
        }

        const [outRes, srvRes, vehRes] = await Promise.allSettled([
          api.get("/outlets"),
          api.get("/services"),
          api.get("/vehicles"),
        ]);

        if (outRes.status === "fulfilled") {
          const list = unwrapData(outRes.value);
          if (Array.isArray(list)) {
            setOutlets(list);
            if (list.length > 0) setActiveOutlet(list[0]);
          }
        }

        if (srvRes.status === "fulfilled") {
          const list = unwrapData(srvRes.value);
          if (Array.isArray(list)) {
            setServices(
              list.map((s: any, idx: number) => ({
                ...s,
                rating: s.rating || "4.9",
                reviewsCount: s.reviewsCount || 120,
                imageUrl: s.imageUrl || SERVICE_IMAGES[idx % SERVICE_IMAGES.length],
              }))
            );
          }
        }

        if (vehRes.status === "fulfilled") {
          const list = unwrapData(vehRes.value);
          if (Array.isArray(list)) {
            setVehicles(list);
            if (list.length > 0) setSelectedVehicle(list[0].id);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const formatRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const toggleBookmark = (id: string) =>
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const visibleServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleQuickBook = async (service: ServiceItem) => {
    if (!activeOutlet) {
      Alert.alert("Cabang Belum Dipilih", "Silakan pilih cabang bengkel terlebih dahulu.");
      return;
    }
    if (!selectedVehicle) {
      Alert.alert(
        "Kendaraan Belum Ada",
        "Tambahkan data kendaraan terlebih dahulu di halaman Profil.",
        [{ text: "Ke Profil", onPress: () => { setDetailService(null); navigation.navigate("Profile"); } }]
      );
      return;
    }

    try {
      setBookingLoading(true);
      await api.post("/bookings", {
        vehicleId: selectedVehicle,
        outletId: activeOutlet.id,
        serviceIds: [service.id],
        scheduledAt: new Date().toISOString(),
      });

      setDetailService(null);
      Alert.alert(
        "Reservasi Berhasil",
        `${service.name} di ${activeOutlet.name} pukul ${selectedTime} WIB telah dijadwalkan.`,
        [{ text: "Lihat Riwayat", onPress: () => navigation.navigate("History") }]
      );
    } catch (err: any) {
      Alert.alert(
        "Gagal Booking",
        err?.response?.data?.message || "Terjadi kesalahan saat membuat reservasi."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Header Biru Melengkung */}
        <View style={styles.blueHeader}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.userInfoRow}
              onPress={() => setOutletModal(true)}
              activeOpacity={0.85}
            >
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={18} color="#1D4ED8" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.greetingText}>Halo, {userName}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                  <Ionicons name="location-outline" size={12} color="#DBEAFE" />
                  <Text style={styles.locationText}>
                    {activeOutlet ? activeOutlet.city : "Pilih Cabang Bengkel"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => navigation.navigate("History")}
              >
                <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerIconBtn, { marginLeft: 6 }]}
                onPress={() => setOutletModal(true)}
              >
                <Ionicons name="ellipsis-vertical" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Cari layanan bengkel..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
              <Ionicons name="search-outline" size={18} color="#64748B" />
            </View>
            <TouchableOpacity
              style={styles.filterSquareBtn}
              onPress={() => navigation.navigate("Booking")}
            >
              <Ionicons name="options-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bodyPadding}>
          {/* Banner Promo Biru */}
          <View style={styles.promoBanner}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.promoDiscount}>Diskon 20%</Text>
              <Text style={styles.promoHeadline}>Spesial Servis Hari Ini!</Text>
              <Text style={styles.promoSub}>
                Potongan langsung untuk booking servis berkala lewat aplikasi.
              </Text>
            </View>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=400&q=80",
              }}
              style={styles.promoImage}
              resizeMode="cover"
            />
          </View>

          {/* Grid 4x2 Kategori Servis */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Layanan Utama</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Booking")}>
              <Text style={styles.viewAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const active = selectedCat === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCell}
                  onPress={() => setSelectedCat(active ? "all" : cat.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.categoryIconBox,
                      active && { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={22}
                      color={active ? "#FFFFFF" : "#1D4ED8"}
                    />
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={1}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Daftar Layanan Populer dari Database */}
          <View style={[styles.sectionHeader, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Layanan Populer</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Booking")}>
              <Text style={styles.viewAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#1D4ED8" style={{ marginVertical: 24 }} />
          ) : visibleServices.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.outletCaption}>
                Belum ada data layanan di database. Pastikan seed backend sudah dijalankan.
              </Text>
            </View>
          ) : (
            visibleServices.map((srv) => {
              const bookmarked = savedIds.includes(srv.id);
              return (
                <TouchableOpacity
                  key={srv.id}
                  style={styles.serviceRowCard}
                  onPress={() => setDetailService(srv)}
                  activeOpacity={0.88}
                >
                  <Image
                    source={{ uri: srv.imageUrl }}
                    style={styles.serviceThumb}
                    resizeMode="cover"
                  />

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.outletCaption}>
                      {activeOutlet?.name || "Tallero Auto Center"}
                    </Text>
                    <Text style={styles.serviceTitle} numberOfLines={1}>
                      {srv.name}
                    </Text>
                    <Text style={styles.servicePrice}>{formatRp(srv.price)}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.ratingText}>
                        {srv.rating} ({srv.reviewsCount} Ulasan)
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleBookmark(srv.id)}
                    style={styles.bookmarkBtn}
                  >
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
        </View>
      </ScrollView>

      {/* Modal Detail Layanan */}
      <Modal
        visible={!!detailService}
        animationType="slide"
        onRequestClose={() => setDetailService(null)}
      >
        {detailService && (
          <View style={styles.detailScreen}>
            <View style={styles.detailHero}>
              <Image
                source={{ uri: detailService.imageUrl }}
                style={styles.detailHeroImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.backCircleBtn}
                onPress={() => setDetailService(null)}
              >
                <Ionicons name="chevron-back" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.detailSheet}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.detailTitleRow}>
                <Text style={styles.detailTitle}>{detailService.name}</Text>
                <TouchableOpacity onPress={() => toggleBookmark(detailService.id)}>
                  <Ionicons
                    name={savedIds.includes(detailService.id) ? "bookmark" : "bookmark-outline"}
                    size={22}
                    color="#1D4ED8"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.providerRow}>
                <Text style={styles.providerName}>{activeOutlet?.name || "Tallero Center"}</Text>
                <Ionicons name="star" size={14} color="#F59E0B" style={{ marginLeft: 10 }} />
                <Text style={styles.ratingText}>
                  {detailService.rating} ({detailService.reviewsCount} Ulasan)
                </Text>
              </View>

              {activeOutlet && (
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={15} color="#1D4ED8" />
                  <Text style={styles.addressText}>{activeOutlet.address}</Text>
                </View>
              )}

              <View style={styles.priceRow}>
                <Text style={styles.detailPrice}>{formatRp(detailService.price)}</Text>
                <Text style={styles.priceUnit}> ({detailService.durationMinutes || 60} Menit)</Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.aboutHeading}>Tentang Layanan</Text>
              <Text style={styles.aboutBody}>{detailService.description}</Text>

              <Text style={[styles.aboutHeading, { marginTop: 16 }]}>Kendaraan & Jam</Text>
              {vehicles.length === 0 ? (
                <TouchableOpacity
                  style={styles.filterPill}
                  onPress={() => {
                    setDetailService(null);
                    navigation.navigate("Profile");
                  }}
                >
                  <Text style={styles.filterPillText}>+ Tambah Kendaraan di Profil</Text>
                </TouchableOpacity>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  {vehicles.map((v) => {
                    const active = v.id === selectedVehicle;
                    return (
                      <TouchableOpacity
                        key={v.id}
                        style={[styles.filterPill, active && styles.filterPillActive]}
                        onPress={() => setSelectedVehicle(v.id)}
                      >
                        <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                          {v.brand} {v.model} ({v.licensePlate})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {["09:00", "10:00", "13:30", "15:30"].map((jam) => {
                  const active = jam === selectedTime;
                  return (
                    <TouchableOpacity
                      key={jam}
                      style={[styles.filterPill, active && styles.filterPillActive]}
                      onPress={() => setSelectedTime(jam)}
                    >
                      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                        {jam} WIB
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.detailBottomBar}>
              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => {
                  setDetailService(null);
                  setOutletModal(true);
                }}
              >
                <Ionicons name="location-outline" size={16} color="#1D4ED8" />
                <Text style={styles.secondaryActionText}>Ganti Cabang</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                disabled={bookingLoading}
                onPress={() => handleQuickBook(detailService)}
              >
                {bookingLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryActionText}>Booking Sekarang</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Modal Pilih Cabang */}
      <Modal
        visible={outletModal}
        transparent
        animationType="slide"
        onRequestClose={() => setOutletModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.outletSheet}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pilih Cabang Bengkel</Text>
              <TouchableOpacity onPress={() => setOutletModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            {outlets.map((o) => (
              <TouchableOpacity
                key={o.id}
                style={[
                  styles.outletOption,
                  o.id === activeOutlet?.id && { borderColor: "#1D4ED8", backgroundColor: "#EFF6FF" },
                ]}
                onPress={() => {
                  setActiveOutlet(o);
                  setOutletModal(false);
                }}
              >
                <Text style={styles.serviceTitle}>{o.name}</Text>
                <Text style={styles.outletCaption}>{o.address}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  blueHeader: {
    backgroundColor: "#1D4ED8",
    paddingTop: Platform.OS === "ios" ? 54 : 36,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  userInfoRow: { flexDirection: "row", alignItems: "center" },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  greetingText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  locationText: { color: "#DBEAFE", fontSize: 11, marginLeft: 4 },
  headerIconBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 13, color: "#0F172A" },
  filterSquareBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginLeft: 10 },
  bodyPadding: { paddingHorizontal: 20, paddingTop: 18 },
  promoBanner: { backgroundColor: "#38BDF8", borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 20 },
  promoDiscount: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  promoHeadline: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", marginTop: 2 },
  promoSub: { color: "#F0F9FF", fontSize: 11, marginTop: 4, lineHeight: 15 },
  promoImage: { width: 96, height: 86, borderRadius: 14, backgroundColor: "#E0F2FE" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  viewAllText: { fontSize: 12, fontWeight: "600", color: "#1D4ED8" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  categoryCell: { width: "23%", alignItems: "center", marginBottom: 14 },
  categoryIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 6 },
  categoryLabel: { fontSize: 11, fontWeight: "500", color: "#475569", textAlign: "center" },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", marginRight: 8, marginBottom: 8 },
  filterPillActive: { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
  filterPillText: { fontSize: 12, fontWeight: "500", color: "#64748B" },
  filterPillTextActive: { color: "#FFFFFF", fontWeight: "600" },
  emptyCard: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 16, alignItems: "center" },
  serviceRowCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: "#F1F5F9" },
  serviceThumb: { width: 78, height: 78, borderRadius: 14, backgroundColor: "#EFF6FF" },
  outletCaption: { fontSize: 11, color: "#94A3B8" },
  serviceTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginTop: 2 },
  servicePrice: { fontSize: 13, fontWeight: "700", color: "#1D4ED8", marginTop: 3 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 11, color: "#64748B", marginLeft: 4 },
  bookmarkBtn: { alignSelf: "flex-start", padding: 4 },
  detailScreen: { flex: 1, backgroundColor: "#FFFFFF" },
  detailHero: { height: 250, backgroundColor: "#DBEAFE" },
  detailHeroImage: { width: "100%", height: "100%" },
  backCircleBtn: { position: "absolute", top: Platform.OS === "ios" ? 50 : 24, left: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center" },
  detailSheet: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -24, paddingHorizontal: 20, paddingTop: 22 },
  detailTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  detailTitle: { fontSize: 19, fontWeight: "700", color: "#0F172A", flex: 1, paddingRight: 10 },
  providerRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  providerName: { fontSize: 13, fontWeight: "600", color: "#1D4ED8" },
  addressRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  addressText: { fontSize: 12, color: "#64748B", marginLeft: 5 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 10 },
  detailPrice: { fontSize: 18, fontWeight: "800", color: "#1D4ED8" },
  priceUnit: { fontSize: 12, color: "#94A3B8" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 },
  aboutHeading: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 6 },
  aboutBody: { fontSize: 13, color: "#64748B", lineHeight: 20 },
  detailBottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#F1F5F9", gap: 12 },
  secondaryActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#EFF6FF", paddingVertical: 13, borderRadius: 12 },
  secondaryActionText: { color: "#1D4ED8", fontSize: 13, fontWeight: "600", marginLeft: 6 },
  primaryActionBtn: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#1D4ED8", paddingVertical: 13, borderRadius: 12 },
  primaryActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)", justifyContent: "flex-end" },
  outletSheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  outletOption: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 10 },
});