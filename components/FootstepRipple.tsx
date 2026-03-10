import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

interface Props {
  isDetected: boolean;
  energy: number;
  value: number;
  isDark: boolean;
}

export default function FootstepRipple({ isDetected, energy, value, isDark }: Props) {
  const theme = isDark ? Colors.dark : Colors.light;
  const ripple1Scale = useRef(new Animated.Value(0.5)).current;
  const ripple1Opacity = useRef(new Animated.Value(0)).current;
  const ripple2Scale = useRef(new Animated.Value(0.5)).current;
  const ripple2Opacity = useRef(new Animated.Value(0)).current;
  const ripple3Scale = useRef(new Animated.Value(0.5)).current;
  const ripple3Opacity = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isDetected) {
      ripple1Scale.setValue(0.5);
      ripple1Opacity.setValue(0);
      ripple2Scale.setValue(0.5);
      ripple2Opacity.setValue(0);
      ripple3Scale.setValue(0.5);
      ripple3Opacity.setValue(0);

      const makeRipple = (scale: Animated.Value, opacity: Animated.Value, delay: number) =>
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 2.5, duration: 700, useNativeDriver: false }),
            Animated.sequence([
              Animated.timing(opacity, { toValue: 0.6, duration: 100, useNativeDriver: false }),
              Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: false }),
            ]),
          ]),
        ]);

      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.sequence([
          Animated.timing(iconScale, { toValue: 1.3, duration: 150, useNativeDriver: false }),
          Animated.timing(iconScale, { toValue: 1, duration: 200, useNativeDriver: false }),
        ]),
        makeRipple(ripple1Scale, ripple1Opacity, 0),
        makeRipple(ripple2Scale, ripple2Opacity, 150),
        makeRipple(ripple3Scale, ripple3Opacity, 300),
      ]).start();
    } else {
      Animated.timing(fadeIn, { toValue: 0, duration: 500, useNativeDriver: false }).start();
    }
  }, [isDetected]);

  return (
    <View style={styles.container}>
      <View style={styles.rippleContainer}>
        <Animated.View
          style={[
            styles.ripple,
            { borderColor: Colors.secondary, transform: [{ scale: ripple3Scale }], opacity: ripple3Opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.ripple,
            { borderColor: Colors.primary, transform: [{ scale: ripple2Scale }], opacity: ripple2Opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.ripple,
            { borderColor: Colors.accent, transform: [{ scale: ripple1Scale }], opacity: ripple1Opacity },
          ]}
        />
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: iconScale }] }]}>
          <View
            style={[
              styles.iconBg,
              { backgroundColor: isDark ? Colors.dark.surfaceElevated : Colors.light.surfaceElevated },
            ]}
          >
            <Ionicons
              name="footsteps"
              size={32}
              color={isDetected ? Colors.secondary : theme.textMuted}
            />
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.infoRow, { opacity: fadeIn }]}>
        <View style={[styles.badge, { backgroundColor: `${Colors.secondary}20` }]}>
          <Ionicons name="footsteps" size={12} color={Colors.secondary} />
          <Text style={[styles.badgeText, { color: Colors.secondary }]}>Step Detected</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${Colors.accent}20` }]}>
          <Ionicons name="flash" size={12} color={Colors.accent} />
          <Text style={[styles.badgeText, { color: Colors.accent }]}>
            {energy.toFixed(3)} J
          </Text>
        </View>
      </Animated.View>

      {!isDetected && (
        <Text style={[styles.waiting, { color: theme.textMuted }]}>Waiting for footstep...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
  },
  rippleContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  iconWrapper: {
    zIndex: 10,
  },
  iconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  waiting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
