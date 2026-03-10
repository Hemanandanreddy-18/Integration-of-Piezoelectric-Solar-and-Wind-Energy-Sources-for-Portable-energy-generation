const PRIMARY = "#6366F1";
const SECONDARY = "#22C55E";
const ACCENT = "#F59E0B";

export const Colors = {
  primary: PRIMARY,
  secondary: SECONDARY,
  accent: ACCENT,

  dark: {
    background: "#0F172A",
    surface: "#1E293B",
    surfaceElevated: "#263352",
    card: "#1E293B",
    border: "#334155",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    tint: PRIMARY,
    tabIconDefault: "#64748B",
    tabIconSelected: PRIMARY,
  },

  light: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceElevated: "#EFF6FF",
    card: "#FFFFFF",
    border: "#E2E8F0",
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    tint: PRIMARY,
    tabIconDefault: "#94A3B8",
    tabIconSelected: PRIMARY,
  },
};

export default {
  light: {
    text: Colors.light.text,
    background: Colors.light.background,
    tint: PRIMARY,
    tabIconDefault: Colors.light.tabIconDefault,
    tabIconSelected: PRIMARY,
  },
};
