import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { getEnergyEquivalents } from "@/lib/energyCalculator";

interface Props {
  energyJoules: number;
  isDark: boolean;
}

export default function EnergyImpactCard({ energyJoules, isDark }: Props) {
  const theme = isDark ? Colors.dark : Colors.light;
  const equiv = getEnergyEquivalents(energyJoules);

  const items = [
    {
      icon: "bulb" as const,
      color: Colors.accent,
      label: "LED Lighting",
      value: equiv.ledMinutes,
      unit: "min",
    },
    {
      icon: "phone-portrait" as const,
      color: Colors.primary,
      label: "Phone Charging",
      value: equiv.phoneSeconds,
      unit: "sec",
    },
    {
      icon: "hardware-chip" as const,
      color: Colors.secondary,
      label: "IoT Sensor Power",
      value: equiv.iotHours,
      unit: "hrs",
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Ionicons name="flash" size={18} color={Colors.accent} />
        <Text style={[styles.title, { color: theme.text }]}>Energy Impact</Text>
      </View>
      <Text style={[styles.energy, { color: theme.textSecondary }]}>
        {energyJoules.toFixed(2)} J generated today
      </Text>
      <View style={styles.divider} />
      <Text style={[styles.equivalent, { color: theme.textMuted }]}>Equivalent to:</Text>
      <View style={styles.items}>
        {items.map((item) => (
          <View key={item.label} style={styles.item}>
            <View style={[styles.iconWrapper, { backgroundColor: `${item.color}18` }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.itemText}>
              <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.itemValue, { color: theme.text }]}>
                {item.value}{" "}
                <Text style={[styles.itemUnit, { color: theme.textMuted }]}>{item.unit}</Text>
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  energy: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.15)",
    marginVertical: 4,
  },
  equivalent: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  items: {
    gap: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  itemValue: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  itemUnit: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
