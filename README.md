# Footstep Energy Generation IoT Dashboard

## 🧾 Short Description

A real-time IoT monitoring system that tracks footstep-driven micro-energy generation using piezoelectric hardware and visualizes live analytics in a mobile app.

## 📌 Project Overview

This project measures electrical energy produced by footsteps and presents it in a professional React Native dashboard.

Footstep energy generation using piezoelectric sensors.
Energy converted to LED brightness.
LDR measures light intensity.
ESP8266 sends data to Firebase.
Mobile app visualizes steps and energy analytics.

## ⚙️ How It Works (Hardware + Software)

1. A footstep applies pressure to the piezoelectric sensor array.
2. Generated energy powers or brightens an LED.
3. An LDR reads the resulting light intensity.
4. ESP8266 captures the analog value from the LDR.
5. ESP8266 publishes readings to Firebase Realtime Database.
6. The Expo mobile app subscribes to Firebase updates and renders live dashboards, trends, and analytics.

## 🏗️ System Architecture

```text
Footstep
→ Piezo Sensors
→ LED
→ LDR
→ ESP8266
→ Firebase
→ Mobile App
```

## ✨ Features

- Real-time step detection
- Energy generation analytics
- Comparison graphs
- Activity heatmap
- Energy timeline
- Light/Dark mode
- Smooth animations
- Device online/offline detection

## 🧰 Tech Stack

- Mobile: Expo, React Native, TypeScript, Expo Router
- Data: Firebase Realtime Database
- Visualization: React Native SVG / chart components
- State and data flow: React Context, TanStack Query
- Backend utilities: Node.js, Express (project includes server-side utilities)

## 🔥 Firebase Data Format

Example payload stored in Firebase Realtime Database:

```json
{
  "sensors": {
    "latest": {
      "value": 243,
      "timestamp": 1712505600000,
      "deviceOnline": true
    },
    "history": {
      "-Nxyz1": { "value": 198, "timestamp": 1712505590000 },
      "-Nxyz2": { "value": 243, "timestamp": 1712505600000 }
    }
  },
  "metrics": {
    "steps": 1284,
    "energy": 3.91
  }
}
```

## 👣 Step Detection Logic

The app/process uses a threshold-based peak detector:

- `STEP_THRESHOLD = 18`
- Peak detection logic:
  - A signal crossing above the threshold is treated as a candidate spike.
  - A valid local peak above threshold is counted as a step event.
- Cooldown logic:
  - After counting one peak, a short cooldown window prevents re-counting noise from the same physical step.
- One spike = one step:
  - Exactly one valid spike should increment the step counter once.

## ⚡ Energy Calculation Formula

Energy is normalized from the ADC value:

$$
energy = \left(\frac{value}{1023}\right) \times 5
$$

## 🚀 Installation Instructions

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create and configure environment variables in `.env` (already added in this repo setup).

## ▶️ Running Instructions

Start Expo development server:

```bash
npm run start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Optional lint check:

```bash
npm run lint
```

## 📁 Folder Structure

```text
.
├── app/                  # Expo Router screens and navigation
├── assets/               # Images and static assets
├── components/           # Reusable UI/data-visualization components
├── constants/            # App constants (colors, config values)
├── contexts/             # React Context providers
├── lib/                  # Core integrations (Firebase, calculators, query client)
├── server/               # Optional Node/Express backend utilities
├── shared/               # Shared schema/types
├── android/              # Android native project
├── scripts/              # Build and utility scripts
└── README.md
```

## 🖼️ Screenshots

Add project screenshots here:

- Dashboard overview
- Analytics tab
- Heatmap and timeline
- Device status indicators

## 🔭 Future Improvements

- OTA firmware monitoring panel for ESP8266 health
- Offline-first sync and local cache replay
- Smarter noise filtering and adaptive thresholds
- Battery health estimation from long-term trends
- Export analytics reports (CSV/PDF)

## 📄 License

This project is licensed under the MIT License.
