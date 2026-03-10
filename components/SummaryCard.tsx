import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  isDark: boolean;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export default function SummaryCard({
  title,
  value,
  unit,
  icon,
  iconColor,
  isDark,
  trend,
  trendValue,
}: Props) {
  const theme = isDark ? Colors.dark : Colors.light;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.title, { color: theme.textMuted }]}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: theme.text }]}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </Text>
        {unit && (
          <Text style={[styles.unit, { color: theme.textSecondary }]}>{unit}</Text>
        )}
      </View>
      {trend && trendValue && (
        <View style={styles.trendRow}>
          <Ionicons
            name={
              trend === "up"
                ? "trending-up"
                : trend === "down"
                ? "trending-down"
                : "remove"
            }
            size={12}
            color={
              trend === "up"
                ? Colors.secondary
                : trend === "down"
                ? "#EF4444"
                : theme.textMuted
            }
          />
          <Text
            style={[
              styles.trendText,
              {
                color:
                  trend === "up"
                    ? Colors.secondary
                    : trend === "down"
                    ? "#EF4444"
                    : theme.textMuted,
              },
            ]}
          >
            {trendValue}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  value: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  trendText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
