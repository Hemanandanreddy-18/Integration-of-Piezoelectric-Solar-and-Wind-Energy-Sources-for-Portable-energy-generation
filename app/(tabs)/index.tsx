import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useSensor } from "@/contexts/SensorContext";
import DeviceStatus from "@/components/DeviceStatus";
import EnergyGauge from "@/components/EnergyGauge";
import FootstepRipple from "@/components/FootstepRipple";
import SummaryCard from "@/components/SummaryCard";
import EnergyImpactCard from "@/components/EnergyImpactCard";
import RecentStepsList from "@/components/RecentStepsList";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {
    isDark,
    isDeviceOnline,
    latestReading,
    analytics,
    recentSteps,
    currentStepEnergy,
    currentStepValue,
    isStepDetected,
  } = useSensor();

  const theme = isDark ? Colors.dark : Colors.light;
  const [refreshing, setRefreshing] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const currentValue = latestReading?.value ?? 0;
  const displayEnergy = currentStepEnergy > 0 ? currentStepEnergy : (currentValue / 1023) * 5;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={
          isDark
            ? ["rgba(99,102,241,0.15)", "transparent"]
            : ["rgba(99,102,241,0.06)", "transparent"]
        }
        style={[styles.headerGradient, { height: topInset + 180 }]}
      />

      <View
        style={[
          styles.header,
          { paddingTop: topInset + 12, backgroundColor: "transparent" },
        ]}
      >
        <View>
          <Text style={[styles.appName, { color: theme.textMuted }]}>StepWatt</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Energy Monitor
          </Text>
        </View>
        <DeviceStatus isDark={isDark} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: bottomInset + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={[styles.gaugeCard, { backgroundColor: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)", borderColor: isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.12)" }]}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            CURRENT ENERGY OUTPUT
          </Text>
          <EnergyGauge
            value={currentValue}
            energy={displayEnergy}
            isDark={isDark}
          />
        </View>

        <View style={[styles.rippleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            LIVE FOOTSTEP DETECTION
          </Text>
          <FootstepRipple
            isDetected={isStepDetected}
            energy={currentStepEnergy}
            value={currentStepValue}
            isDark={isDark}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Summary</Text>
        <View style={styles.cardsGrid}>
          <SummaryCard
            title="Steps Today"
            value={analytics?.stepsToday ?? 0}
            icon="footsteps"
            iconColor={Colors.primary}
            isDark={isDark}
            trend={
              analytics && analytics.stepsToday > analytics.stepsYesterday
                ? "up"
                : analytics && analytics.stepsToday < analytics.stepsYesterday
                ? "down"
                : "neutral"
            }
            trendValue="vs yesterday"
          />
          <SummaryCard
            title="Energy Today"
            value={(analytics?.energyToday ?? 0).toFixed(2)}
            unit="J"
            icon="flash"
            iconColor={Colors.accent}
            isDark={isDark}
            trend={
              analytics && analytics.energyToday > analytics.energyYesterday
                ? "up"
                : "neutral"
            }
            trendValue="vs yesterday"
          />
          <SummaryCard
            title="Peak Intensity"
            value={analytics?.peakIntensity ?? 0}
            icon="speedometer"
            iconColor="#EF4444"
            isDark={isDark}
          />
          <SummaryCard
            title="Avg Step Energy"
            value={(analytics?.avgStepEnergy ?? 0).toFixed(3)}
            unit="J"
            icon="analytics"
            iconColor={Colors.secondary}
            isDark={isDark}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Period Totals</Text>
        <View style={styles.cardsGrid}>
          <SummaryCard
            title="This Week"
            value={analytics?.stepsThisWeek ?? 0}
            icon="calendar"
            iconColor="#8B5CF6"
            isDark={isDark}
            unit="steps"
          />
          <SummaryCard
            title="This Month"
            value={analytics?.stepsThisMonth ?? 0}
            icon="calendar-outline"
            iconColor="#EC4899"
            isDark={isDark}
            unit="steps"
          />
          <SummaryCard
            title="Weekly Energy"
            value={(analytics?.energyThisWeek ?? 0).toFixed(1)}
            unit="J"
            icon="battery-charging"
            iconColor={Colors.secondary}
            isDark={isDark}
          />
          <SummaryCard
            title="Monthly Energy"
            value={(analytics?.energyThisMonth ?? 0).toFixed(1)}
            unit="J"
            icon="power"
            iconColor={Colors.accent}
            isDark={isDark}
          />
        </View>

        <EnergyImpactCard energyJoules={analytics?.energyToday ?? 0} isDark={isDark} />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Steps</Text>
        <RecentStepsList steps={recentSteps} isDark={isDark} limit={8} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 1,
  },
  appName: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  gaugeCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  rippleCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
    marginLeft: 4,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
