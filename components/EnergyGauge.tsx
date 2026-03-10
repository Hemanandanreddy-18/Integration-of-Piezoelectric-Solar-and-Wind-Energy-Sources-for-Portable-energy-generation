import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Svg, { Circle, G, Defs, LinearGradient, Stop } from "react-native-svg";
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

  const progress = Math.min(1, Math.max(0, value / maxValue));

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();

    let animFrameId: ReturnType<typeof setTimeout>;
    const start = displayEnergy;
    const end = energy;
    const duration = 600;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplayEnergy(start + (end - start) * eased);
      if (t < 1) {
        animFrameId = setTimeout(tick, 16);
      } else {
        setDisplayEnergy(end);
      }
    };
    tick();
    return () => clearTimeout(animFrameId);
  }, [progress, energy]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="gaugeGradFg" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={Colors.primary} />
              <Stop offset="1" stopColor="#818CF8" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            stroke={isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)"}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <G rotation="-90" origin={`${cx}, ${cy}`}>
            <AnimatedCircle
              cx={cx}
              cy={cy}
              r={RADIUS}
              stroke="url(#gaugeGradFg)"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
            />
          </G>
        </Svg>
        <View style={styles.center}>
          <Text style={[styles.energyValue, { color: theme.text }]}>
            {displayEnergy.toFixed(2)}
          </Text>
          <Text style={[styles.unit, { color: theme.textSecondary }]}>Joules</Text>
          <View
            style={[
              styles.rawBadge,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
          >
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
