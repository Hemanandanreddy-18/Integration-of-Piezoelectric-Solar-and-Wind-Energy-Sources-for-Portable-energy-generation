# StepWatt — Footstep Energy Generation Monitoring System

## Overview

A premium IoT dashboard mobile app (Expo React Native) that monitors footstep-generated energy from a piezoelectric sensor system. The ESP8266 microcontroller reads LDR values when an LED is illuminated by step energy, then streams data to Firebase Realtime Database in real-time.

## Architecture

**Hardware Flow:**
Footstep → Piezoelectric sensor → LED lit → LDR detects brightness → ESP8266 reads LDR → Firebase RTDB → Mobile app

**App Stack:**
- Expo SDK 54 / React Native
- Expo Router (file-based routing, tabs)
- Firebase Realtime Database (real-time listener)
- React Native SVG (custom charts)
- AsyncStorage (settings persistence)

## Project Structure

```
app/
  _layout.tsx           # Root layout with SensorProvider
  (tabs)/
    _layout.tsx         # Tab navigation (Dashboard, Analytics, Settings)
    index.tsx           # Dashboard screen
    analytics.tsx       # Analytics screen
    settings.tsx        # Settings screen

components/
  DeviceStatus.tsx      # Online/offline indicator with pulsing animation
  EnergyGauge.tsx       # Circular SVG gauge showing energy output
  FootstepRipple.tsx    # Ripple animation on step detection
  SummaryCard.tsx       # Metric cards grid
  EnergyImpactCard.tsx  # Energy equivalents (LED/phone/IoT)
  RecentStepsList.tsx   # Timeline of recent detected steps
  LineChartSVG.tsx      # Custom SVG line chart
  BarChartSVG.tsx       # Custom SVG bar chart
  HeatmapGrid.tsx       # Time-of-day activity heatmap

contexts/
  SensorContext.tsx     # Firebase listener, step detection, theme, calibration

lib/
  firebase.ts           # Firebase app initialization
  energyCalculator.ts   # Energy formulas, analytics computation, time utils
  query-client.ts       # React Query setup (for backend API)
```

## Key Features

- **Real-time Firebase streaming** — live LDR sensor data via `onValue` listener
- **Step detection** — threshold-based (value > 18), spike detection per reading
- **Energy calculation** — `E = (value/1023) × 5 × calibrationFactor` in Joules
- **Device online/offline** — 30-second timeout detection with pulsing status dot
- **Dashboard** — gauge, ripple animation, summary cards, energy impact, recent steps
- **Analytics** — line/bar charts, time-segment heatmap, intensity histogram, cumulative growth
- **Settings** — theme toggle (light/dark/system), calibration factor selection

## Firebase Configuration

- Project: `meow-ccc20`
- Database URL: `https://meow-ccc20-default-rtdb.firebaseio.com`
- Path: `/sensorData`
- Data format: `{ value: number, timestamp_unix: number, timestamp_ist: string }`

## Theme / Colors

- Primary: `#6366F1` (indigo)
- Secondary: `#22C55E` (green — online indicator)
- Accent: `#F59E0B` (amber — energy/alerts)
- Dark background: `#0F172A`
- Light background: `#F8FAFC`
