export const STEP_THRESHOLD = 18;
export const MAX_SENSOR_VALUE = 1023;

export interface SensorReading {
  value: number;
  timestamp_unix: number;
  timestamp_ist: string;
}

export interface ProcessedStep {
  id: string;
  value: number;
  energy: number;
  timestamp: number;
  timestampIST: string;
}

export function normalizeValue(value: number): number {
  return value / MAX_SENSOR_VALUE;
}

export function calculateEnergy(value: number, calibrationFactor: number = 1): number {
  const normalized = normalizeValue(value);
  return normalized * 5 * calibrationFactor;
}

export function isStep(value: number): boolean {
  return value > STEP_THRESHOLD;
}

export function getTimeSegment(timestamp: number): "morning" | "afternoon" | "evening" | "night" {
  const date = new Date(timestamp * 1000);
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 16) return "afternoon";
  if (hour >= 16 && hour < 20) return "evening";
  return "night";
}

export function getStartOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export function getStartOfWeek(date: Date): number {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export function getStartOfMonth(date: Date): number {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export interface AnalyticsData {
  stepsToday: number;
  stepsYesterday: number;
  stepsThisWeek: number;
  stepsThisMonth: number;
  energyToday: number;
  energyYesterday: number;
  energyThisWeek: number;
  energyThisMonth: number;
  avgStepEnergy: number;
  peakIntensity: number;
  segmentData: {
    morning: { steps: number; energy: number };
    afternoon: { steps: number; energy: number };
    evening: { steps: number; energy: number };
    night: { steps: number; energy: number };
  };
  hourlyData: { hour: number; energy: number; steps: number }[];
  intensityBuckets: number[];
  cumulativeEnergyToday: { time: number; energy: number }[];
}

export function computeAnalytics(steps: ProcessedStep[], calibrationFactor: number = 1): AnalyticsData {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const yesterdayStart = todayStart - 86400;
  const weekStart = getStartOfWeek(now);
  const monthStart = getStartOfMonth(now);

  let stepsToday = 0, stepsYesterday = 0, stepsThisWeek = 0, stepsThisMonth = 0;
  let energyToday = 0, energyYesterday = 0, energyThisWeek = 0, energyThisMonth = 0;
  let peakIntensity = 0;

  const segmentData = {
    morning: { steps: 0, energy: 0 },
    afternoon: { steps: 0, energy: 0 },
    evening: { steps: 0, energy: 0 },
    night: { steps: 0, energy: 0 },
  };

  const hourlyMap: Record<number, { energy: number; steps: number }> = {};
  for (let i = 0; i < 24; i++) hourlyMap[i] = { energy: 0, steps: 0 };

  const intensityBuckets = new Array(10).fill(0);
  const cumulativeMap: Map<number, number> = new Map();

  for (const step of steps) {
    const ts = step.timestamp;
    const energy = step.energy;

    if (step.value > peakIntensity) peakIntensity = step.value;

    const bucketIdx = Math.min(9, Math.floor((step.value / MAX_SENSOR_VALUE) * 10));
    intensityBuckets[bucketIdx]++;

    const seg = getTimeSegment(ts);
    segmentData[seg].steps++;
    segmentData[seg].energy += energy;

    const hour = new Date(ts * 1000).getHours();
    hourlyMap[hour].energy += energy;
    hourlyMap[hour].steps++;

    if (ts >= todayStart) {
      stepsToday++;
      energyToday += energy;
      const minuteBucket = Math.floor((ts - todayStart) / 300) * 300 + todayStart;
      cumulativeMap.set(minuteBucket, (cumulativeMap.get(minuteBucket) ?? 0) + energy);
    }
    if (ts >= yesterdayStart && ts < todayStart) {
      stepsYesterday++;
      energyYesterday += energy;
    }
    if (ts >= weekStart) {
      stepsThisWeek++;
      energyThisWeek += energy;
    }
    if (ts >= monthStart) {
      stepsThisMonth++;
      energyThisMonth += energy;
    }
  }

  const avgStepEnergy = stepsToday > 0 ? energyToday / stepsToday : 0;

  const hourlyData = Object.entries(hourlyMap).map(([hour, data]) => ({
    hour: parseInt(hour),
    ...data,
  }));

  const cumulativeEntries = Array.from(cumulativeMap.entries()).sort((a, b) => a[0] - b[0]);
  let cumSum = 0;
  const cumulativeEnergyToday = cumulativeEntries.map(([time, e]) => {
    cumSum += e;
    return { time, energy: cumSum };
  });

  return {
    stepsToday,
    stepsYesterday,
    stepsThisWeek,
    stepsThisMonth,
    energyToday,
    energyYesterday,
    energyThisWeek,
    energyThisMonth,
    avgStepEnergy,
    peakIntensity,
    segmentData,
    hourlyData,
    intensityBuckets,
    cumulativeEnergyToday,
  };
}

export function getEnergyEquivalents(energyJoules: number) {
  return {
    ledMinutes: (energyJoules / 0.3).toFixed(1),
    phoneSeconds: (energyJoules / 5).toFixed(1),
    iotHours: (energyJoules / 0.036).toFixed(1),
  };
}
