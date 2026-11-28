import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api, { unwrapData } from "../services/api";

export default function HistoryScreen({ navigation }: any) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DONE">("ALL");

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api.get("/bookings")
        .then((res) => {
          const list = unwrapData(res);
          if (Array.isArray(list)) {
            setBookings(
              list.map((b: any) => ({
                id: b.id,
                code: b.code || `TLR-${String(b.id).slice(0, 6).toUpperCase()}`,
                serviceName:
                  b.services?.[0]?.service?.name ||
                  b.service?.name ||
                  "Servis Kendaraan",
                outletName: b.outlet?.name || "Tallero Auto Center",
                vehicleLabel: b.vehicle
                  ? `${b.vehicle.brand} • ${b.vehicle.licensePlate}`
                  : "Kendaraan Terdaftar",
                dateLabel: new Date(b.scheduledAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
                totalPrice: Number(b.totalPrice || b.services?.[0]?.price || 0),
                status: b.status || "CONFIRMED",
              }))
            );
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  const formatRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const list = bookings.filter((b) => {
    if (filter === "ACTIVE") return b.status !== "COMPLETED";
    if (filter === "DONE") return b.status === "COMPLETED";
    return true;
  });

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topIcon} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="chevron-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Riwayat Booking</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.pillRow}>
          {[
            { key: "ALL", label: "Semua" },
            { key: "ACTIVE", label: "Berjalan" },
            { key: "DONE", label: "Selesai" },
          ].map((t) => {
            const active = filter === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setFilter(t.key as any)}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1D4ED8" style={{ marginVertical: 28 }} />
        ) : list.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.subText}>Belum ada riwayat booking pada kategori ini.</Text>
          </View>
        ) : (
          list.map((item) => {
            const done = item.status === "COMPLETED";
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.codeText}>{item.code}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: done ? "#EFF6FF" : "#DBEAFE" },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {done ? "Selesai" : item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.serviceTitle}>{item.serviceName}</Text>
                <Text style={styles.subText}>
                  {item.vehicleLabel} • {item.outletName}
                </Text>

                <View style={styles.footerRow}>
                  <Text style={styles.subText}>{item.dateLabel}</Text>
                  <Text style={styles.priceText}>{formatRp(item.totalPrice)}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
  pillRow: { flexDirection: "row", marginBottom: 14 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  pillActive: { backgroundColor: "#1D4ED8", borderColor: "#1D4ED8" },
  pillText: { fontSize: 12, fontWeight: "500", color: "#64748B" },
  pillTextActive: { color: "#FFFFFF", fontWeight: "600" },
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, alignItems: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  codeText: { fontSize: 11, fontWeight: "600", color: "#64748B" },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600", color: "#1D4ED8" },
  serviceTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A", marginTop: 6 },
  subText: { fontSize: 12, color: "#64748B", marginTop: 3 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priceText: { fontSize: 14, fontWeight: "700", color: "#1D4ED8" },
});