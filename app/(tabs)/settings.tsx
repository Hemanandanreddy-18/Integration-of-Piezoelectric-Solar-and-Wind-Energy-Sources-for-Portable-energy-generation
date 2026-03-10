import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useSensor } from "@/contexts/SensorContext";
import { ThemeMode } from "@/contexts/SensorContext";
import { STEP_THRESHOLD, MAX_SENSOR_VALUE } from "@/lib/energyCalculator";

const CALIBRATION_OPTIONS = [
  { label: "0.5×", value: 0.5 },
  { label: "0.75×", value: 0.75 },
  { label: "1.0× (Default)", value: 1.0 },
  { label: "1.25×", value: 1.25 },
  { label: "1.5×", value: 1.5 },
  { label: "2.0×", value: 2.0 },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, themeMode, setThemeMode, calibrationFactor, setCalibrationFactor } = useSensor();
  const theme = isDark ? Colors.dark : Colors.light;

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const THEME_OPTIONS: { key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "light", label: "Light", icon: "sunny" },
    { key: "dark", label: "Dark", icon: "moon" },
    { key: "system", label: "System", icon: "phone-portrait" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={18} color={Colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>
            Choose your preferred color scheme
          </Text>
          <View style={styles.themeOptions}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setThemeMode(opt.key)}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor:
                      themeMode === opt.key
                        ? Colors.primary
                        : isDark
                        ? Colors.dark.surfaceElevated
                        : Colors.light.surfaceElevated,
                    borderColor:
                      themeMode === opt.key ? Colors.primary : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={18}
                  color={themeMode === opt.key ? "#fff" : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.themeBtnText,
                    { color: themeMode === opt.key ? "#fff" : theme.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={18} color={Colors.accent} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Energy Calibration</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>
            Adjust the energy calculation multiplier based on your sensor readings
          </Text>
          <View style={styles.calibrationGrid}>
            {CALIBRATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setCalibrationFactor(opt.value)}
                style={[
                  styles.calibrationBtn,
                  {
                    backgroundColor:
                      calibrationFactor === opt.value
                        ? Colors.accent
                        : isDark
                        ? Colors.dark.surfaceElevated
                        : Colors.light.surfaceElevated,
                    borderColor:
                      calibrationFactor === opt.value ? Colors.accent : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.calibrationText,
                    { color: calibrationFactor === opt.value ? "#fff" : theme.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.formulaBox, { backgroundColor: isDark ? Colors.dark.surfaceElevated : Colors.light.surfaceElevated }]}>
            <Text style={[styles.formulaLabel, { color: theme.textMuted }]}>Current Formula</Text>
            <Text style={[styles.formula, { color: theme.text }]}>
              E = (LDR / {MAX_SENSOR_VALUE}) × 5 × {calibrationFactor}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="hardware-chip" size={18} color={Colors.secondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Device Configuration</Text>
          </View>
          {[
            { label: "Step Detection Threshold", value: `>${STEP_THRESHOLD}`, icon: "footsteps" as const, color: Colors.primary },
            { label: "Max Sensor Value", value: String(MAX_SENSOR_VALUE), icon: "speedometer" as const, color: Colors.accent },
            { label: "Offline Timeout", value: "30 seconds", icon: "timer" as const, color: "#EF4444" },
            { label: "Firebase Path", value: "/sensorData", icon: "server" as const, color: Colors.secondary },
            { label: "Data Points", value: "Last 500", icon: "list" as const, color: "#8B5CF6" },
          ].map((item) => (
            <View key={item.label} style={[styles.infoRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.infoIconWrap, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon} size={16} color={item.color} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={18} color={theme.textMuted} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          </View>
          <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
            StepWatt monitors footstep-generated energy from a piezoelectric sensor system. The ESP8266 microcontroller reads LDR sensor values when an LED is illuminated by step energy, then streams data to Firebase in real-time.
          </Text>
          <View style={styles.buildInfo}>
            <View style={styles.buildRow}>
              <Text style={[styles.buildLabel, { color: theme.textMuted }]}>Version</Text>
              <Text style={[styles.buildValue, { color: theme.text }]}>1.0.0</Text>
            </View>
            <View style={styles.buildRow}>
              <Text style={[styles.buildLabel, { color: theme.textMuted }]}>Hardware</Text>
              <Text style={[styles.buildValue, { color: theme.text }]}>ESP8266 + LDR</Text>
            </View>
            <View style={styles.buildRow}>
              <Text style={[styles.buildLabel, { color: theme.textMuted }]}>Database</Text>
              <Text style={[styles.buildValue, { color: theme.text }]}>Firebase RTDB</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  section: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  themeOptions: {
    flexDirection: "row",
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  themeBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  calibrationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  calibrationBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  calibrationText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  formulaBox: {
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  formulaLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  formula: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  aboutText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  buildInfo: {
    gap: 8,
  },
  buildRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buildLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  buildValue: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
