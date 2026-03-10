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
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isDetected) {
      ripple1.setValue(0);
      ripple2.setValue(0);
      ripple3.setValue(0);
      fadeIn.setValue(0);
      iconScale.setValue(1);

      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(iconScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
          Animated.timing(iconScale, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.stagger(150, [
          Animated.sequence([
            Animated.timing(ripple1, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(ripple1, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(ripple2, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(ripple2, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(ripple3, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(ripple3, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    } else {
      Animated.timing(fadeIn, { toValue: 0, duration: 500, useNativeDriver: true }).start();
    }
  }, [isDetected]);

  const makeRippleStyle = (anim: Animated.Value) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.5] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.6, 0] }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.rippleContainer}>
        <Animated.View style={[styles.ripple, makeRippleStyle(ripple3), { borderColor: Colors.secondary }]} />
        <Animated.View style={[styles.ripple, makeRippleStyle(ripple2), { borderColor: Colors.primary }]} />
        <Animated.View style={[styles.ripple, makeRippleStyle(ripple1), { borderColor: Colors.accent }]} />
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: iconScale }] }]}>
          <View style={[styles.iconBg, { backgroundColor: isDark ? Colors.dark.surfaceElevated : Colors.light.surfaceElevated }]}>
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
        <Text style={[styles.waiting, { color: theme.textMuted }]}>
          Waiting for footstep...
        </Text>
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
