import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Colors } from "@/constants/colors";

interface Props {
  value: number;
  maxValue?: number;
  energy: number;
  isDark: boolean;
}

const SIZE = 180;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function EnergyGauge({ value, maxValue = 1023, energy, isDark }: Props) {
  const theme = isDark ? Colors.dark : Colors.light;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [displayEnergy, setDisplayEnergy] = useState(0);

  const progress = Math.min(1, value / maxValue);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();

    const start = displayEnergy;
    const end = energy;
    const duration = 600;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      setDisplayEnergy(start + (end - start) * t);
      if (t >= 1) {
        clearInterval(interval);
        setDisplayEnergy(end);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [progress, energy]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const getColor = () => {
    if (progress > 0.7) return "#EF4444";
    if (progress > 0.4) return Colors.accent;
    return Colors.primary;
  };

  const barColor = getColor();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Defs>
            <LinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={Colors.primary} />
              <Stop offset="1" stopColor="#818CF8" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)"}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="url(#gaugeGrad)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <View style={styles.center}>
          <Text style={[styles.energyValue, { color: theme.text }]}>
            {displayEnergy.toFixed(2)}
          </Text>
          <Text style={[styles.unit, { color: theme.textSecondary }]}>Joules</Text>
          <View style={[styles.rawBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
            <Text style={[styles.rawValue, { color: theme.textMuted }]}>
              LDR: {value}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.barRow}>
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((threshold) => (
          <View
            key={threshold}
            style={[
              styles.bar,
              {
                backgroundColor:
                  progress >= threshold
                    ? threshold > 0.7
                      ? "#EF4444"
                      : threshold > 0.4
                      ? Colors.accent
                      : Colors.primary
                    : isDark
                    ? "#1E293B"
                    : "#E2E8F0",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 12,
  },
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    gap: 2,
  },
  energyValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  rawBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  rawValue: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  barRow: {
    flexDirection: "row",
    gap: 3,
  },
  bar: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
});
