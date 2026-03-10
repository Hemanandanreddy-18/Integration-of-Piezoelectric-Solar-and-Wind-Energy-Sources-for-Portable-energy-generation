import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, query, orderByChild, limitToLast, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";
import {
  SensorReading,
  ProcessedStep,
  calculateEnergy,
  isStep,
  computeAnalytics,
  AnalyticsData,
} from "@/lib/energyCalculator";

export type ThemeMode = "system" | "light" | "dark";

interface SensorContextValue {
  latestReading: SensorReading | null;
  recentSteps: ProcessedStep[];
  analytics: AnalyticsData | null;
  isDeviceOnline: boolean;
  lastUpdateTime: number | null;
  calibrationFactor: number;
  setCalibrationFactor: (v: number) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  currentStepEnergy: number;
  currentStepValue: number;
  isStepDetected: boolean;
  allReadings: SensorReading[];
}

const SensorContext = createContext<SensorContextValue | null>(null);

const OFFLINE_THRESHOLD_SECONDS = 30;
const MAX_STORED_STEPS = 200;

export function SensorProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [calibrationFactor, setCalibrationFactorState] = useState(1);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [recentSteps, setRecentSteps] = useState<ProcessedStep[]>([]);
  const [allReadings, setAllReadings] = useState<SensorReading[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [currentStepEnergy, setCurrentStepEnergy] = useState(0);
  const [currentStepValue, setCurrentStepValue] = useState(0);
  const [isStepDetected, setIsStepDetected] = useState(false);
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenKeysRef = useRef<Set<string>>(new Set());

  const isDark =
    themeMode === "dark" || (themeMode === "system" && systemScheme === "dark");

  useEffect(() => {
    AsyncStorage.multiGet(["themeMode", "calibrationFactor"]).then((pairs) => {
      for (const [key, val] of pairs) {
        if (key === "themeMode" && val) setThemeModeState(val as ThemeMode);
        if (key === "calibrationFactor" && val) setCalibrationFactorState(parseFloat(val));
      }
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem("themeMode", mode);
  }, []);

  const setCalibrationFactor = useCallback((v: number) => {
    setCalibrationFactorState(v);
    AsyncStorage.setItem("calibrationFactor", String(v));
  }, []);

  const markOnline = useCallback(() => {
    setIsDeviceOnline(true);
    if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
    offlineTimerRef.current = setTimeout(() => {
      setIsDeviceOnline(false);
    }, OFFLINE_THRESHOLD_SECONDS * 1000);
  }, []);

  useEffect(() => {
    const sensorRef = query(
      ref(database, "sensorData"),
      orderByChild("timestamp_unix"),
      limitToLast(500)
    );

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const rawData = snapshot.val();
      const readings: SensorReading[] = [];
      const newSteps: ProcessedStep[] = [];

      if (typeof rawData === "object" && rawData !== null) {
        const fbKeys = Object.keys(rawData);
        for (const fbKey of fbKeys) {
          const item = rawData[fbKey];
          if (item && typeof item.value === "number" && item.timestamp_unix) {
            const reading: SensorReading = {
              value: item.value,
              timestamp_unix: item.timestamp_unix,
              timestamp_ist: item.timestamp_ist || "",
            };
            readings.push(reading);

            if (!seenKeysRef.current.has(fbKey) && isStep(item.value)) {
              const energy = calculateEnergy(item.value, calibrationFactor);
              newSteps.push({
                id: fbKey,
                value: item.value,
                energy,
                timestamp: item.timestamp_unix,
                timestampIST: item.timestamp_ist || "",
              });
              seenKeysRef.current.add(fbKey);
            } else if (!seenKeysRef.current.has(fbKey)) {
              seenKeysRef.current.add(fbKey);
            }
          }
        }
      }

      readings.sort((a, b) => a.timestamp_unix - b.timestamp_unix);

      if (readings.length > 0) {
        const latest = readings[readings.length - 1];
        setLatestReading(latest);
        setLastUpdateTime(latest.timestamp_unix);
        markOnline();
        setAllReadings(readings);
      }

      if (newSteps.length > 0) {
        newSteps.sort((a, b) => b.timestamp - a.timestamp);
        const latestStep = newSteps[0];
        setCurrentStepEnergy(latestStep.energy);
        setCurrentStepValue(latestStep.value);
        setIsStepDetected(true);
        setTimeout(() => setIsStepDetected(false), 2000);

        setRecentSteps((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const uniqueNew = newSteps.filter((s) => !existingIds.has(s.id));
          return [...uniqueNew, ...prev]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, MAX_STORED_STEPS);
        });
      }
    });

    return () => {
      off(sensorRef);
      if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
    };
  }, [calibrationFactor, markOnline]);

  useEffect(() => {
    if (allReadings.length > 0) {
      const steps = allReadings
        .filter((r) => isStep(r.value))
        .map((r, i) => ({
          id: `analytics-${r.timestamp_unix}-${i}`,
          value: r.value,
          energy: calculateEnergy(r.value, calibrationFactor),
          timestamp: r.timestamp_unix,
          timestampIST: r.timestamp_ist,
        }));
      setAnalytics(computeAnalytics(steps, calibrationFactor));
    }
  }, [allReadings, calibrationFactor]);

  return (
    <SensorContext.Provider
      value={{
        latestReading,
        recentSteps,
        analytics,
        isDeviceOnline,
        lastUpdateTime,
        calibrationFactor,
        setCalibrationFactor,
        themeMode,
        setThemeMode,
        isDark,
        currentStepEnergy,
        currentStepValue,
        isStepDetected,
        allReadings,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  const ctx = useContext(SensorContext);
  if (!ctx) throw new Error("useSensor must be used within SensorProvider");
  return ctx;
}
