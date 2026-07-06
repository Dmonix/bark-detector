# Dog Bark Detection System

```
ESP32-S3 → Wi-Fi → bark-api (Node.js) → MongoDB + Audio Storage
                         ↑
                  bark-dashboard (React)
```

## Repos

| Repo | Stack | Purpose |
|------|-------|---------|
| `bark-api` | Node.js, Express, MongoDB | REST API — receives bark events, stores metadata + audio |
| `bark-dashboard` | React, Vite, Recharts | Web dashboard — visualises events (Phase 2) |
| `bark-firmware` | C++, Arduino/IDF, PlatformIO | ESP32-S3 firmware — reads mic, detects bark, POSTs event |

## Quick Start

### API
```bash
cd bark-api
cp .env.example .env   # fill in your MongoDB URI
npm install
npm run dev
```

### Dashboard
```bash
cd bark-dashboard
cp .env.example .env   # set VITE_API_BASE_URL
npm install
npm run dev
```

### Firmware
```bash
cd bark-firmware
# Edit src/main/config.h with your Wi-Fi credentials and API IP
pio run -e esp32-s3-devkitc-1 --target upload
```

## Running Tests
```bash
# API unit tests
cd bark-api && npm test

# Dashboard unit tests
cd bark-dashboard && npm test

# Firmware unit tests (runs natively, no hardware needed)
cd bark-firmware && pio test -e native
```

## Roadmap
- **Phase 1** ← you are here: hardware + API + basic detection
- **Phase 2**: 5-second WAV recording & upload, dashboard playback
- **Phase 3**: pre-trigger buffer, ambient calibration, offline queue
- **Phase 4**: multi-device, notifications, bark classification, camera
