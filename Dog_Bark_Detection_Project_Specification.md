# Dog Bark Detection Project Specification

## Overview

A home monitoring system using an ESP32-S3 and a digital I2S MEMS microphone to detect dog barks, record short audio clips, and upload events to a local REST API. Metadata is stored in MongoDB while audio is stored on disk.

## Current Decisions

| Category | Decision | Status | Notes |
|----------|----------|--------|-------|
| Microcontroller | ESP32-S3 Development Board (preferred) | Yes | Robotico ESP32 Dev Board also suitable for MVP |
| Microphone | Digital I2S MEMS microphone | Yes | INMP441, ICS-43434, or SPH0645 |
| Power | USB | Yes | Indoor installation |
| Connectivity | Wi-Fi | Yes | Local REST API |
| Detection | RMS volume threshold | MVP | No ML initially |
| Recording | 5 seconds after detection | Planned | WAV, 16-bit PCM, 16 kHz mono |
| API | REST | Yes | POST /api/bark |
| Database | MongoDB | Yes | Raw bark events |
| Audio Storage | Filesystem | Yes | Store WAV files separately |

## Architecture

```text
ESP32-S3 -> Wi-Fi -> Node.js API -> MongoDB + Audio Storage
```

## API

### Endpoint

```http
POST /api/bark
```

### Example Payload

```json
{
  "device": "living-room",
  "timestamp": "2026-06-26T18:14:22Z",
  "peakVolume": 82,
  "duration": 5
}
```

Use multipart/form-data to upload metadata and audio.wav.

## MongoDB

```javascript
{
  device: "living-room",
  timestamp: ISODate(),
  peakVolume: 82,
  duration: 5,
  audioPath: "/audio/2026/06/26/bark_181422.wav"
}
```

## Hardware

- ESP32-S3 Development Board
- Digital I2S MEMS microphone
- USB cable
- Dupont jumper wires
- Breadboard
- Enclosure (optional)

Estimated prototype cost: R350–500.

## Roadmap

### Phase 1
- Acquire hardware
- Read microphone
- Detect bark
- Connect to Wi-Fi
- POST bark event
- Store metadata

### Phase 2
- Record 5-second WAV
- Upload audio
- Playback in dashboard

### Phase 3
- Rolling pre-trigger buffer
- Ambient calibration
- False-positive suppression
- Heartbeat
- Offline queue

### Phase 4
- Multiple ESP32 units
- Bark heat maps
- Notifications
- Bark classification
- Camera integration
- Dashboard
