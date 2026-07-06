#pragma once

// ── Wi-Fi ─────────────────────────────────────────────────────────────────────
#define WIFI_SSID     "YOUR_SSID"
#define WIFI_PASSWORD "YOUR_PASSWORD"

// ── API ───────────────────────────────────────────────────────────────────────
#define API_HOST "192.168.1.100"
#define API_PORT 3000
#define API_ENDPOINT "/api/bark"

// ── Device identity ───────────────────────────────────────────────────────────
#define DEVICE_NAME "living-room"

// ── I2S microphone pins (INMP441 / ICS-43434) ─────────────────────────────────
#define I2S_WS_PIN   15
#define I2S_SCK_PIN  14
#define I2S_SD_PIN   32
#define I2S_PORT     I2S_NUM_0

// ── Audio ─────────────────────────────────────────────────────────────────────
#define SAMPLE_RATE          16000   // Hz
#define SAMPLE_BITS          16
#define CHANNELS             1
#define DMA_BUF_COUNT        8
#define DMA_BUF_LEN          256     // samples per DMA buffer

// ── Detection ─────────────────────────────────────────────────────────────────
#define BARK_RMS_THRESHOLD   500     // RMS amplitude units (tune on device)
#define BARK_COOLDOWN_MS     3000    // minimum ms between consecutive events
