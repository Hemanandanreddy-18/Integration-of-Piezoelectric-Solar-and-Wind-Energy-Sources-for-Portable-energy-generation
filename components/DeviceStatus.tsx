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
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isDeviceOnline) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 2.2, duration: 900, useNativeDriver: false }),
            Animated.timing(pulseOpacity, { toValue: 0, duration: 900, useNativeDriver: false }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 1, duration: 0, useNativeDriver: false }),
            Animated.timing(pulseOpacity, { toValue: 0.4, duration: 0, useNativeDriver: false }),
          ]),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulseScale.setValue(1);
      pulseOpacity.setValue(0);
    }
  }, [isDeviceOnline]);

  const formatLastUpdate = () => {
    if (!lastUpdateTime) return "No data";
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
              {
                backgroundColor: Colors.secondary,
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
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
    width: 18,
    height: 18,
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
