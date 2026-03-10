import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

interface SegmentData {
  morning: { steps: number; energy: number };
  afternoon: { steps: number; energy: number };
  evening: { steps: number; energy: number };
  night: { steps: number; energy: number };
}

interface Props {
  segmentData: SegmentData;
  isDark: boolean;
}

const SEGMENTS = [
  { key: "morning" as const, label: "Morning", time: "5AM–12PM" },
  { key: "afternoon" as const, label: "Afternoon", time: "12PM–4PM" },
  { key: "evening" as const, label: "Evening", time: "4PM–8PM" },
  { key: "night" as const, label: "Night", time: "8PM–5AM" },
];

export default function HeatmapGrid({ segmentData, isDark }: Props) {
  const theme = isDark ? Colors.dark : Colors.light;
  const maxSteps = Math.max(1, ...SEGMENTS.map((s) => segmentData[s.key].steps));

  const getIntensity = (steps: number) => Math.max(0.05, steps / maxSteps);

  return (
    <View style={styles.container}>
      {SEGMENTS.map((seg) => {
        const data = segmentData[seg.key];
        const intensity = getIntensity(data.steps);
        const bgAlpha = Math.round(intensity * 255).toString(16).padStart(2, "0");

        return (
          <View
            key={seg.key}
            style={[
              styles.cell,
              {
                backgroundColor: `${Colors.primary}${bgAlpha}`,
                borderColor: intensity > 0.1 ? `${Colors.primary}40` : theme.border,
              },
            ]}
          >
            <View style={styles.cellTop}>
              <Text style={[styles.segLabel, { color: intensity > 0.5 ? "#fff" : theme.text }]}>
                {seg.label}
              </Text>
              <Text style={[styles.segTime, { color: intensity > 0.5 ? "rgba(255,255,255,0.7)" : theme.textMuted }]}>
                {seg.time}
              </Text>
            </View>
            <View style={styles.cellBottom}>
              <Text style={[styles.stepCount, { color: intensity > 0.5 ? "#fff" : theme.text }]}>
                {data.steps}
              </Text>
              <Text style={[styles.stepLabel, { color: intensity > 0.5 ? "rgba(255,255,255,0.7)" : theme.textMuted }]}>
                steps
              </Text>
              <Text style={[styles.energyVal, { color: intensity > 0.5 ? "rgba(255,255,255,0.9)" : theme.textSecondary }]}>
                {data.energy.toFixed(2)} J
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cell: {
    width: "47.5%",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  cellTop: {
    gap: 2,
  },
  segLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  segTime: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  cellBottom: {
    gap: 2,
  },
  stepCount: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  stepLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  energyVal: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
});
