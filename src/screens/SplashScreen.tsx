import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animasi muncul logo & teks
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animasi gir berputar pelan terus-menerus
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Animasi loading bar bawah (2.5 detik)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      if (onFinish) {
        onFinish();
      }
    });
  }, [fadeAnim, scaleAnim, spinAnim, progressAnim, onFinish]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient
      colors={["#012436", "#013C58", "#00537A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />

      {/* Dekorasi Lingkaran Latar Belakang */}
      <View className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
      <View className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-tallero-sky/5" />

      {/* Konten Tengah (Logo + Brand) */}
      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="items-center"
        >
          {/* Lingkaran Emblem Logo */}
          <View className="w-28 h-28 rounded-full bg-white items-center justify-center shadow-2xl border-4 border-tallero-sky/30">
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <FontAwesome6 name="gear" size={48} color="#013C58" />
            </Animated.View>

            {/* Badge Aksen Kuning */}
            <View className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-tallero-amber items-center justify-center border-2 border-white">
              <FontAwesome6 name="wrench" size={14} color="#012436" />
            </View>
          </View>

          {/* Nama Brand */}
          <Text className="text-white text-4xl font-extrabold tracking-[6px] mt-7">
            TALLERO
          </Text>

          {/* Garis Aksen Amber */}
          <View className="w-12 h-1 rounded-full bg-tallero-amber my-3" />

          {/* Tagline */}
          <Text className="text-tallero-sky text-xs font-medium tracking-widest uppercase text-center">
            Sistem Booking & Servis Bengkel
          </Text>
        </Animated.View>
      </View>

      {/* Bagian Bawah: Progress Bar & Versi */}
      <View className="pb-12 px-12 items-center">
        <View className="w-48 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <Animated.View
            style={{ width: progressWidth }}
            className="h-full bg-tallero-amber rounded-full"
          />
        </View>
        <Text className="text-white/50 text-[11px] mt-3 tracking-wider">
          Memuat aplikasi...
        </Text>
      </View>
    </LinearGradient>
  );
}