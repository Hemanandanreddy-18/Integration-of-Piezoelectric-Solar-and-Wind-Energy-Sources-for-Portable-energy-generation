import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { ProcessedStep } from "@/lib/energyCalculator";

interface Props {
  steps: ProcessedStep[];
  isDark: boolean;
  limit?: number;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m}:${s} ${period}`;
}

export default function RecentStepsList({ steps, isDark, limit = 10 }: Props) {
  const theme = isDark ? Colors.dark : Colors.light;
  const displaySteps = steps.slice(0, limit);

  if (displaySteps.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="footsteps-outline" size={32} color={theme.textMuted} />
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No steps recorded yet</Text>
        <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>Walk on the sensor to generate energy</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Ionicons name="time" size={16} color={theme.textSecondary} />
        <Text style={[styles.headerText, { color: theme.textSecondary }]}>Recent Activity</Text>
      </View>
      {displaySteps.map((step, index) => (
        <View key={step.id}>
          <View style={styles.row}>
            <View style={[styles.dotLine]}>
              <View style={[styles.stepDot, { backgroundColor: Colors.primary }]} />
              {index < displaySteps.length - 1 && (
                <View style={[styles.line, { backgroundColor: theme.border }]} />
              )}
            </View>
            <View style={styles.rowContent}>
              <View style={styles.rowTop}>
                <Text style={[styles.time, { color: theme.textMuted }]}>{formatTime(step.timestamp)}</Text>
                <View style={[styles.energyTag, { backgroundColor: `${Colors.accent}18` }]}>
                  <Ionicons name="flash" size={10} color={Colors.accent} />
                  <Text style={[styles.energyText, { color: Colors.accent }]}>
                    {step.energy.toFixed(3)} J
                  </Text>
                </View>
              </View>
              <View style={styles.rowBottom}>
                <Text style={[styles.label, { color: theme.text }]}>Step detected</Text>
                <View style={[styles.intensityBar, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.intensityFill,
                      {
                        width: `${(step.value / 1023) * 100}%`,
                        backgroundColor: Colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  empty: {
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  emptySubtext: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  headerText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 2,
  },
  dotLine: {
    alignItems: "center",
    width: 12,
    paddingTop: 4,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 1,
    flex: 1,
    marginTop: 4,
    minHeight: 20,
  },
  rowContent: {
    flex: 1,
    gap: 4,
    paddingBottom: 14,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  energyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  energyText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  rowBottom: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  intensityBar: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  intensityFill: {
    height: "100%",
    borderRadius: 2,
  },
});
