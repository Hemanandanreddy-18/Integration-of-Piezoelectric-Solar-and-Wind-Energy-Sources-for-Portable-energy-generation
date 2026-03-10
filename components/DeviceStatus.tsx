import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Colors } from "@/constants/colors";
import { useSensor } from "@/contexts/SensorContext";

interface Props {
  isDark: boolean;
}

export default function DeviceStatus({ isDark }: Props) {
  const { isDeviceOnline, lastUpdateTime } = useSensor();
  const theme = isDark ? Colors.dark : Colors.light;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isDeviceOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isDeviceOnline, pulseAnim]);

  const formatLastUpdate = () => {
    if (!lastUpdateTime) return "No data received";
    const now = Math.floor(Date.now() / 1000);
    const diff = now - lastUpdateTime;
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.dotWrapper}>
        {isDeviceOnline && (
          <Animated.View
            style={[
              styles.pulse,
              { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.8], outputRange: [0.4, 0] }) },
            ]}
          />
        )}
        <View
          style={[
            styles.dot,
            { backgroundColor: isDeviceOnline ? Colors.secondary : "#EF4444" },
          ]}
        />
      </View>
      <View>
        <Text style={[styles.status, { color: isDeviceOnline ? Colors.secondary : "#EF4444" }]}>
          {isDeviceOnline ? "ONLINE" : "OFFLINE"}
        </Text>
        <Text style={[styles.lastUpdate, { color: theme.textMuted }]}>
          {formatLastUpdate()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dotWrapper: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
  },
  pulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
    position: "absolute",
  },
  status: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },
  lastUpdate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
});
