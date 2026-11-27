import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { unwrapData } from "../services/api";

interface OutletItem {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  categoryId: string;
  categoryName: string;
  rating: string;
  reviewCount: number;
  imageUrl: string;
}

const MECHANIC_HERO_IMG =
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80";

const QUICK_MENU = [
  { id: "cat-1", label: "Berkala", icon: "tool" as const },
  { id: "cat-2", label: "Ganti Oli", icon: "droplet" as const },
  { id: "cat-3", label: "Kelistrikan", icon: "zap" as const },
  { id: "cat-4", label: "AC Mobil", icon: "wind" as const },
  { id: "cat-5", label: "Rem & Kaki", icon: "disc" as const },
  { id: "cat-6", label: "Spooring", icon: "compass" as const },
  { id: "cat-7", label: "Tune Up", icon: "sliders" as const },
  { id: "all", label: "Lainnya", icon: "grid" as const },
];

const FILTER_CHIPS = [
  { id: "all", label: "Semua" },
  { id: "cat-1", label: "Berkala" },
  { id: "cat-2", label: "Ganti Oli" },
  { id: "cat-4", label: "AC Mobil" },
  { id: "cat-5", label: "Rem & Kaki" },
];

const FALLBACK_OUTLETS: OutletItem[] = [
  { id: "outlet-1", name: "Tallero Auto Depok", city: "Depok, Jawa Barat", address: "Jl. Margonda Raya No. 214", phone: "+628110000001" },
  { id: "outlet-2", name: "Tallero Express Cibubur", city: "Jakarta Timur", address: "Jl. Alternatif Cibubur Km. 4", phone: "+628110000002" },
  { id: "outlet-3", name: "Tallero Flagship BSD", city: "Tangerang Selatan", address: "Jl. Pahlawan Seribu Sektor IV", phone: "+628110000003" },
];

const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: "srv-1",
    name: "Servis Berkala 10.000 KM",
    description: "Pengecekan menyeluruh 32 titik komponen mesin, pembersihan throttle body, pemeriksaan kampas rem, aki, dan kalibrasi scanner OBD-II.",
    price: 450000,
    durationMinutes: 90,
    categoryId: "cat-1",
    categoryName: "Berkala",
    rating: "4.9",
    reviewCount: 128,
    imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "srv-2",
    name: "Ganti Oli Full Synthetic",
    description: "Penggantian oli mesin full synthetic 4 liter beserta filter oli original dan pengecekan tekanan angin serta kondisi busi.",
    price: 385000,
    durationMinutes: 45,
    categoryId: "cat-2",
    categoryName: "Ganti Oli",
    rating: "4.8",
    reviewCount: 94,
    imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "srv-3",
    name: "Flushing & Servis AC Mobil",
    description: "Kuras freon R134a dengan mesin otomatis, penggantian oli kompresor, pembersihan evaporator, dan uji kebocoran.",
    price: 320000,
    durationMinutes: 60,
    categoryId: "cat-4",
    categoryName: "AC Mobil",
    rating: "4.9",
    reviewCount: 76,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "srv-4",
    name: "Spooring 3D & Balancing",
    description: "Penyelarasan sudut roda menggunakan sensor laser 3D presisi tinggi dan balancing 4 roda untuk kestabilan berkendara.",
    price: 250000,
    durationMinutes: 60,
    categoryId: "cat-5",
    categoryName: "Rem & Kaki",
    rating: "4.8",
    reviewCount: 112,
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
  },
];

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState("Pelanggan");
  const [outlets, setOutlets] = useState<OutletItem[]>(FALLBACK_OUTLETS);
  const [activeOutlet, setActiveOutlet] = useState<OutletItem>(FALLBACK_OUTLETS[0]);
  const [services, setServices] = useState<ServiceItem[]>(FALLBACK_SERVICES);
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>(["srv-1"]);
  const [detailService, setDetailService] = useState<ServiceItem | null>(null);
  const [outletModal, setOutletModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("tallero_user").then((raw) => {
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.name) setUserName(u.name.split(" ")[0]);
      }
    });

    api.get("/outlets")
      .then((res) => {
        const list = unwrapData(res);
        if (Array.isArray(list) && list.length > 0) {
          setOutlets(list);
          setActiveOutlet(list[0]);
        }
      })
      .catch(() => {});

    api.get("/services")
      .then((res) => {
        const list = unwrapData(res);
        if (Array.isArray(list) && list.length > 0) {
          setServices(
            list.map((s: any, idx: number) => ({
              ...s,
              categoryId: s.categoryId || "cat-1",
              categoryName: s.category?.name || "Berkala",
              rating: "4.9",
              reviewCount: 80 + idx * 12,
              imageUrl: s.imageUrl || FALLBACK_SERVICES[idx % FALLBACK_SERVICES.length].imageUrl,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const formatRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const toggleSave = (id: string) =>
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const visibleServices = services.filter((s) => {
    const matchCat = selectedCat === "all" || s.categoryId === selectedCat;
    const matchText =
      !searchQuery.trim() || s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchText;
  });

  return (
    <View style={styles.screen}>
      {/* HEADER BIRU MELENGKUNG (Persis Referensi Layar 1) */}
      <View style={styles.blueHeader}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => setOutletModal(true)}
            activeOpacity={0.85}
          >
            <View style={styles.avatarCircle}>
              <Feather name="user" size={18} color="#1E60D5" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.greetingText}>Hi, {userName} 👋</Text>
              <Text style={styles.locationSub}>{activeOutlet.city}</Text>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setOutletModal(true)}>
              <Feather name="bell" size={18} color="#FFFFFF" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIconBtn, { marginLeft: 6 }]}
              onPress={() => navigation.navigate("Profile")}
            >
              <Feather name="more-vertical" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar Putih + Tombol Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari layanan bengkel..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
            <Feather name="search" size={16} color="#64748B" />
          </View>
          <TouchableOpacity
            style={styles.filterSquareBtn}
            onPress={() => navigation.navigate("Booking")}
          >
            <Feather name="sliders" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* BANNER PROMO BIRU LANGIT (Persis "20% Off Today's Special!") */}
        <TouchableOpacity
          style={styles.promoBanner}
          onPress={() => navigation.navigate("Booking")}
          activeOpacity={0.9}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.promoBig}>Diskon 20%</Text>
            <Text style={styles.promoSubTitle}>Spesial Servis Berkala!</Text>
            <Text style={styles.promoDesc}>
              Booking tanpa antre di cabang {activeOutlet.name}.
            </Text>
          </View>
          <Image
            source={{ uri: MECHANIC_HERO_IMG }}
            style={styles.promoThumb}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* SECTION 1: LAYANAN UTAMA (Grid 4x2 Persis "Most Used Services") */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Layanan Utama</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Booking")}>
            <Text style={styles.viewAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.iconGrid}>
          {QUICK_MENU.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.iconGridItem}
              onPress={() => setSelectedCat(item.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconSquare,
                  selectedCat === item.id && styles.iconSquareActive,
                ]}
              >
                <Feather
                  name={item.icon}
                  size={20}
                  color={selectedCat === item.id ? "#FFFFFF" : "#1E60D5"}
                />
              </View>
              <Text style={styles.iconLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SECTION 2: LAYANAN POPULER + CHIPS (Persis "Most Popular Services") */}
        <View style={[styles.rowBetween, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Layanan Populer</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Booking")}>
            <Text style={styles.viewAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 12 }}
        >
          {FILTER_CHIPS.map((chip) => {
            const active = selectedCat === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCat(chip.id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* LIST KARTU LAYANAN HORIZONTAL */}
        {visibleServices.map((srv) => {
          const isSaved = savedIds.includes(srv.id);
          return (
            <TouchableOpacity
              key={srv.id}
              style={styles.serviceCard}
              onPress={() => setDetailService(srv)}
              activeOpacity={0.88}
            >
              <Image
                source={{ uri: srv.imageUrl }}
                style={styles.serviceThumb}
                resizeMode="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.outletCaption}>{activeOutlet.name}</Text>
                <Text style={styles.serviceName} numberOfLines={1}>
                  {srv.name}
                </Text>
                <Text style={styles.priceBlue}>
                  {formatRp(srv.price)}
                  <Text style={styles.priceUnit}> /sesi</Text>
                </Text>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {srv.rating} ({srv.reviewCount} Ulasan)
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bookmarkBtn}
                onPress={() => toggleSave(srv.id)}
              >
                <Feather
                  name="bookmark"
                  size={16}
                  color={isSaved ? "#1E60D5" : "#CBD5E1"}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* MODAL DETAIL LAYANAN (Persis Layar 3 Referensi) */}
      <Modal visible={!!detailService} animationType="slide">
        {detailService && (
          <View style={styles.detailContainer}>
            {/* Hero Image Atas */}
            <View style={styles.detailHero}>
              <Image
                source={{ uri: detailService.imageUrl }}
                style={styles.detailHeroImg}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.backCircle}
                onPress={() => setDetailService(null)}
              >
                <Feather name="chevron-left" size={20} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Lembar Putih Melengkung */}
            <View style={styles.detailSheet}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.rowBetween}>
                  <Text style={styles.detailTitle}>{detailService.name}</Text>
                  <TouchableOpacity onPress={() => toggleSave(detailService.id)}>
                    <Feather
                      name="bookmark"
                      size={18}
                      color={savedIds.includes(detailService.id) ? "#1E60D5" : "#94A3B8"}
                    />
                  </TouchableOpacity>
                </View>

                <View style={[styles.ratingRow, { marginTop: 6 }]}>
                  <Text style={styles.detailOutletBlue}>{activeOutlet.name}</Text>
                  <Feather
                    name="star"
                    size={12}
                    color="#F59E0B"
                    style={{ marginLeft: 10 }}
                  />
                  <Text style={styles.ratingText}>
                    {detailService.rating} ({detailService.reviewCount} Ulasan)
                  </Text>
                </View>

                <View style={[styles.ratingRow, { marginTop: 6 }]}>
                  <Feather name="map-pin" size={13} color="#1E60D5" />
                  <Text style={styles.detailAddress}>{activeOutlet.address}</Text>
                </View>

                <Text style={styles.detailPrice}>
                  {formatRp(detailService.price)}
                  <Text style={styles.priceUnit}> /sesi ({detailService.durationMinutes} mnt)</Text>
                </Text>

                <View style={styles.divider} />

                <Text style={styles.aboutHeading}>Tentang Layanan</Text>
                <Text style={styles.aboutDesc}>{detailService.description}</Text>
              </ScrollView>

              {/* 2 Tombol Bawah (Persis "Message" & "Book Now") */}
              <View style={styles.bottomActionRow}>
                <TouchableOpacity
                  style={styles.softBlueBtn}
                  onPress={() => Linking.openURL(`tel:${activeOutlet.phone}`)}
                >
                  <Feather name="phone" size={15} color="#1E60D5" />
                  <Text style={styles.softBlueBtnText}>Hubungi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.solidBlueBtn}
                  onPress={() => {
                    const id = detailService.id;
                    setDetailService(null);
                    navigation.navigate("Booking", {
                      serviceId: id,
                      outletId: activeOutlet.id,
                    });
                  }}
                >
                  <Text style={styles.solidBlueBtnText}>Booking Sekarang</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* MODAL PILIH OUTLET */}
      <Modal visible={outletModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={[styles.rowBetween, { marginBottom: 14 }]}>
              <Text style={styles.sectionTitle}>Pilih Cabang Bengkel</Text>
              <TouchableOpacity onPress={() => setOutletModal(false)}>
                <Feather name="x" size={19} color="#64748B" />
              </TouchableOpacity>
            </View>
            {outlets.map((o) => {
              const active = o.id === activeOutlet.id;
              return (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.outletCard, active && styles.outletCardActive]}
                  onPress={() => {
                    setActiveOutlet(o);
                    setOutletModal(false);
                  }}
                >
                  <Text style={styles.serviceName}>{o.name}</Text>
                  <Text style={styles.outletCaption}>
                    {o.address} • {o.city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  blueHeader: {
    backgroundColor: "#1E60D5",
    paddingTop: Platform.OS === "ios" ? 54 : 32,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  userRow: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  greetingText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  locationSub: { color: "#DBEAFE", fontSize: 11, marginTop: 2 },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#38BDF8",
    position: "absolute",
    top: 7,
    right: 8,
  },
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: "#1E293B", marginRight: 8 },
  filterSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  scroll: { padding: 20, paddingBottom: 100 },
  promoBanner: {
    backgroundColor: "#38A3D8",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  promoBig: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  promoSubTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "600", marginTop: 2 },
  promoDesc: { color: "#E0F2FE", fontSize: 11, marginTop: 4, lineHeight: 16 },
  promoThumb: {
    width: 96,
    height: 84,
    borderRadius: 14,
    backgroundColor: "#E0F2FE",
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  viewAllText: { fontSize: 12, fontWeight: "500", color: "#1E60D5" },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },
  iconGridItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 16,
  },
  iconSquare: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 6,
  },
  iconSquareActive: {
    backgroundColor: "#1E60D5",
    borderColor: "#1E60D5",
  },
  iconLabel: { fontSize: 11, fontWeight: "500", color: "#475569", textAlign: "center" },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#1E60D5", borderColor: "#1E60D5" },
  chipText: { fontSize: 12, fontWeight: "500", color: "#64748B" },
  chipTextActive: { color: "#FFFFFF" },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  serviceThumb: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: "#EBF3FE",
  },
  outletCaption: { fontSize: 11, color: "#94A3B8" },
  serviceName: { fontSize: 14, fontWeight: "600", color: "#1E293B", marginTop: 2 },
  priceBlue: { fontSize: 14, fontWeight: "600", color: "#1E60D5", marginTop: 4 },
  priceUnit: { fontSize: 11, fontWeight: "400", color: "#94A3B8" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 11, color: "#64748B", marginLeft: 4 },
  bookmarkBtn: { padding: 6, alignSelf: "flex-start" },
  detailContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  detailHero: { height: 240, backgroundColor: "#E0F2FE" },
  detailHeroImg: { width: "100%", height: "100%" },
  backCircle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 22,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailSheet: {
    flex: 1,
    marginTop: -24,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
  },
  detailTitle: { fontSize: 19, fontWeight: "600", color: "#1E293B", flex: 1 },
  detailOutletBlue: { fontSize: 13, fontWeight: "600", color: "#1E60D5" },
  detailAddress: { fontSize: 12, color: "#64748B", marginLeft: 5 },
  detailPrice: { fontSize: 20, fontWeight: "700", color: "#1E60D5", marginTop: 12 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 16 },
  aboutHeading: { fontSize: 14, fontWeight: "600", color: "#1E293B", marginBottom: 6 },
  aboutDesc: { fontSize: 13, color: "#64748B", lineHeight: 20 },
  bottomActionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    gap: 12,
  },
  softBlueBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBF3FE",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  softBlueBtnText: { color: "#1E60D5", fontSize: 14, fontWeight: "600" },
  solidBlueBtn: {
    flex: 1.4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E60D5",
    paddingVertical: 14,
    borderRadius: 14,
  },
  solidBlueBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
  },
  outletCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  outletCardActive: { borderColor: "#1E60D5", backgroundColor: "#F8FAFC" },
});