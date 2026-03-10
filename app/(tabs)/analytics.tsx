import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useSensor } from "@/contexts/SensorContext";
import LineChartSVG from "@/components/LineChartSVG";
import BarChartSVG from "@/components/BarChartSVG";
import HeatmapGrid from "@/components/HeatmapGrid";
import { calculateEnergy, isStep, getStartOfDay, getStartOfWeek, getStartOfMonth } from "@/lib/energyCalculator";

type Filter = "day" | "week" | "month";

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, analytics, allReadings, calibrationFactor } = useSensor();
  const theme = isDark ? Colors.dark : Colors.light;
  const [filter, setFilter] = useState<Filter>("day");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const energyChartData = useMemo(() => {
    if (!allReadings.length) return [];
    const now = new Date();

    if (filter === "day") {
      const hourly: Record<number, number> = {};
      for (let h = 0; h < 24; h++) hourly[h] = 0;
      const todayStart = getStartOfDay(now);
      for (const r of allReadings) {
        if (r.timestamp_unix >= todayStart && isStep(r.value)) {
          const hour = new Date(r.timestamp_unix * 1000).getHours();
          hourly[hour] += calculateEnergy(r.value, calibrationFactor);
        }
      }
      return Object.entries(hourly).map(([h, e]) => ({
        label: `${h}h`,
        value: e,
      }));
    }

    if (filter === "week") {
      const weekStart = getStartOfWeek(now);
      const days: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (const r of allReadings) {
        if (r.timestamp_unix >= weekStart && isStep(r.value)) {
          const dayOfWeek = new Date(r.timestamp_unix * 1000).getDay();
          days[dayOfWeek] += calculateEnergy(r.value, calibrationFactor);
        }
      }
      return Object.entries(days).map(([d, e]) => ({
        label: dayNames[parseInt(d)],
        value: e,
      }));
    }

    if (filter === "month") {
      const monthStart = getStartOfMonth(now);
      const daysInMonth: Record<number, number> = {};
      for (let d = 1; d <= 31; d++) daysInMonth[d] = 0;
      for (const r of allReadings) {
        if (r.timestamp_unix >= monthStart && isStep(r.value)) {
          const day = new Date(r.timestamp_unix * 1000).getDate();
          daysInMonth[day] = (daysInMonth[day] ?? 0) + calculateEnergy(r.value, calibrationFactor);
        }
      }
      return Object.entries(daysInMonth)
        .filter(([_, v]) => v > 0 || parseInt(_) <= new Date().getDate())
        .map(([d, e]) => ({
          label: d,
          value: e,
        }));
    }

    return [];
  }, [allReadings, filter, calibrationFactor]);

  const comparisonData = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: "Yesterday", value: analytics.energyYesterday, color: `${Colors.primary}80` },
      { label: "Today", value: analytics.energyToday, color: Colors.primary },
    ];
  }, [analytics]);

  const weeklyComparisonData = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: "Month", value: analytics.energyThisMonth / 4, color: `${Colors.secondary}80` },
      { label: "Week", value: analytics.energyThisWeek, color: Colors.secondary },
    ];
  }, [analytics]);

  const intensityHistogramData = useMemo(() => {
    if (!analytics) return [];
    const bucketLabels = [
      "0-10", "10-20", "20-30", "30-40", "40-50",
      "50-60", "60-70", "70-80", "80-90", "90-100"
    ];
    return analytics.intensityBuckets.map((count, i) => ({
      label: bucketLabels[i],
      value: count,
    }));
  }, [analytics]);

  const cumulativeData = useMemo(() => {
    if (!analytics?.cumulativeEnergyToday?.length) return [];
    return analytics.cumulativeEnergyToday.map(({ time, energy }) => {
      const d = new Date(time * 1000);
      return {
        label: `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`,
        value: energy,
      };
    });
  }, [analytics]);

  const hourlyStepsData = useMemo(() => {
    if (!analytics?.hourlyData) return [];
    return analytics.hourlyData.map((d) => ({
      label: `${d.hour}`,
      value: d.steps,
    }));
  }, [analytics]);

  const filters: { key: Filter; label: string }[] = [
    { key: "day", label: "Today" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>
        <View style={[styles.filterRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterBtn,
                filter === f.key && { backgroundColor: Colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? "#fff" : theme.textSecondary },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Energy Generated</Text>
            <Text style={[styles.chartSubtitle, { color: theme.textMuted }]}>Joules</Text>
          </View>
          <LineChartSVG data={energyChartData} isDark={isDark} color={Colors.primary} label="energy" />
        </View>

        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Hourly Step Count</Text>
            <Ionicons name="footsteps" size={14} color={theme.textMuted} />
          </View>
          <BarChartSVG data={hourlyStepsData} isDark={isDark} color={Colors.secondary} label="steps" />
        </View>

        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Today vs Yesterday</Text>
            <Ionicons name="git-compare" size={14} color={theme.textMuted} />
          </View>
          <BarChartSVG data={comparisonData} isDark={isDark} color={Colors.primary} label="compare" height={100} />
        </View>

        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Activity Heatmap</Text>
            <Text style={[styles.chartSubtitle, { color: theme.textMuted }]}>By time of day</Text>
          </View>
          {analytics ? (
            <HeatmapGrid segmentData={analytics.segmentData} isDark={isDark} />
          ) : (
            <View style={styles.noData}>
              <Text style={[styles.noDataText, { color: theme.textMuted }]}>No data yet</Text>
            </View>
          )}
        </View>

        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Cumulative Energy Today</Text>
            <Text style={[styles.chartSubtitle, { color: theme.textMuted }]}>Growth over time</Text>
          </View>
          <LineChartSVG
            data={cumulativeData.length > 0 ? cumulativeData : [{ label: "now", value: 0 }]}
            isDark={isDark}
            color={Colors.accent}
            label="cumulative"
            fill
          />
        </View>

        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Intensity Distribution</Text>
            <Text style={[styles.chartSubtitle, { color: theme.textMuted }]}>Footstep strength histogram</Text>
          </View>
          <BarChartSVG
            data={intensityHistogramData}
            isDark={isDark}
            color={Colors.accent}
            label="intensity"
          />
        </View>

        {analytics && (
          <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Period Comparison</Text>
            <View style={styles.statsGrid}>
              {[
                { label: "Yesterday Steps", value: analytics.stepsYesterday, icon: "footsteps" as const, color: Colors.primary },
                { label: "This Week Steps", value: analytics.stepsThisWeek, icon: "calendar" as const, color: "#8B5CF6" },
                { label: "Yesterday Energy", value: `${analytics.energyYesterday.toFixed(2)}J`, icon: "flash" as const, color: Colors.accent },
                { label: "Week Energy", value: `${analytics.energyThisWeek.toFixed(2)}J`, icon: "battery-charging" as const, color: Colors.secondary },
              ].map((item) => (
                <View key={item.label} style={[styles.statItem, { backgroundColor: isDark ? Colors.dark.surfaceElevated : Colors.light.surfaceElevated }]}>
                  <Ionicons name={item.icon} size={16} color={item.color} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{item.value}</Text>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  filterRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  chartCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chartTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  chartSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  noData: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  statsCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
