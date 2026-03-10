import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { Colors } from "@/constants/colors";

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  isDark: boolean;
  color?: string;
  label?: string;
  height?: number;
  showDots?: boolean;
  fill?: boolean;
}

export default function LineChartSVG({
  data,
  isDark,
  color = Colors.primary,
  label = "",
  height = 160,
  showDots = true,
  fill = true,
}: Props) {
  const theme = isDark ? Colors.dark : Colors.light;
  const padding = { top: 10, right: 16, bottom: 32, left: 40 };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    const filtered = data.filter((d) => d.value > 0);
    if (filtered.length === 0) return null;

    const maxVal = Math.max(...data.map((d) => d.value));
    const minVal = 0;
    const range = maxVal - minVal || 1;

    return { maxVal, minVal, range };
  }, [data]);

  if (!chartData || !data || data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No data</Text>
      </View>
    );
  }

  const svgWidth = 340;
  const svgHeight = height;
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const { maxVal, minVal, range } = chartData;

  const getX = (i: number) => padding.left + (i / (data.length - 1 || 1)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minVal) / range) * chartHeight;

  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value), ...d }));

  let pathD = "";
  let fillD = "";

  points.forEach((p, i) => {
    if (i === 0) {
      pathD += `M ${p.x} ${p.y}`;
      fillD += `M ${p.x} ${svgHeight - padding.bottom}`;
      fillD += ` L ${p.x} ${p.y}`;
    } else {
      const prev = points[i - 1];
      const cpX = (prev.x + p.x) / 2;
      pathD += ` C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
      fillD += ` C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
    }
  });

  if (points.length > 0) {
    fillD += ` L ${points[points.length - 1].x} ${svgHeight - padding.bottom} Z`;
  }

  const yLabels = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    val: minVal + f * range,
    y: getY(minVal + f * range),
  }));

  const xLabels = data
    .map((d, i) => ({ label: d.label, x: getX(i), i }))
    .filter((_, i) => {
      const step = Math.max(1, Math.floor(data.length / 6));
      return i % step === 0 || i === data.length - 1;
    });

  return (
    <View>
      <Svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <Defs>
          <LinearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.4" />
            <Stop offset="1" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {yLabels.map(({ val, y }) => (
          <React.Fragment key={y}>
            <Line
              x1={padding.left}
              y1={y}
              x2={svgWidth - padding.right}
              y2={y}
              stroke={isDark ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.2)"}
              strokeWidth={1}
            />
            <SvgText
              x={padding.left - 5}
              y={y + 4}
              fill={theme.textMuted}
              fontSize={9}
              textAnchor="end"
              fontFamily="Inter_400Regular"
            >
              {val > 0.1 ? val.toFixed(1) : "0"}
            </SvgText>
          </React.Fragment>
        ))}

        {xLabels.map(({ label: l, x, i }) => (
          <SvgText
            key={i}
            x={x}
            y={svgHeight - 4}
            fill={theme.textMuted}
            fontSize={9}
            textAnchor="middle"
            fontFamily="Inter_400Regular"
          >
            {l}
          </SvgText>
        ))}

        {fill && <Path d={fillD} fill={`url(#grad-${label})`} />}
        <Path d={pathD} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {showDots &&
          points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} stroke={isDark ? Colors.dark.card : Colors.light.card} strokeWidth={1.5} />
          ))}
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
