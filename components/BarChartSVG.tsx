import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Text as SvgText, Line, Defs, LinearGradient, Stop } from "react-native-svg";
import { Colors } from "@/constants/colors";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: DataPoint[];
  isDark: boolean;
  color?: string;
  height?: number;
  label?: string;
}

export default function BarChartSVG({
  data,
  isDark,
  color = Colors.primary,
  height = 140,
  label = "bar",
}: Props) {
  const theme = isDark ? Colors.dark : Colors.light;
  const padding = { top: 10, right: 12, bottom: 28, left: 36 };
  const svgWidth = 340;
  const svgHeight = height;
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No data</Text>
      </View>
    );
  }

  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const barWidth = (chartWidth / data.length) * 0.65;
  const barGap = chartWidth / data.length;

  const xLabels = data
    .map((d, i) => ({ label: d.label, i }))
    .filter((_, i) => {
      const step = Math.max(1, Math.floor(data.length / 8));
      return i % step === 0 || i === data.length - 1;
    });

  const yTicks = [0, 0.5, 1].map((f) => ({
    val: f * maxVal,
    y: padding.top + chartHeight - f * chartHeight,
  }));

  return (
    <View>
      <Svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <Defs>
          <LinearGradient id={`barGrad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {yTicks.map(({ val, y }) => (
          <React.Fragment key={y}>
            <Line
              x1={padding.left}
              y1={y}
              x2={svgWidth - padding.right}
              y2={y}
              stroke={isDark ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.2)"}
              strokeWidth={1}
            />
            <SvgText
              x={padding.left - 4}
              y={y + 4}
              fill={theme.textMuted}
              fontSize={9}
              textAnchor="end"
            >
              {val > 0.1 ? val.toFixed(1) : "0"}
            </SvgText>
          </React.Fragment>
        ))}

        {data.map((d, i) => {
          const barHeight = (d.value / maxVal) * chartHeight;
          const x = padding.left + i * barGap + (barGap - barWidth) / 2;
          const y = padding.top + chartHeight - barHeight;
          const barColor = d.color || `url(#barGrad-${label})`;

          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              rx={3}
              fill={barColor}
            />
          );
        })}

        {xLabels.map(({ label: l, i }) => {
          const x = padding.left + i * barGap + barGap / 2;
          return (
            <SvgText
              key={i}
              x={x}
              y={svgHeight - 4}
              fill={theme.textMuted}
              fontSize={9}
              textAnchor="middle"
            >
              {l}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
