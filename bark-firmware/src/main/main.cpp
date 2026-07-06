#include <Arduino.h>
#include <driver/i2s.h>
#include "config.h"
#include "../bark_detector/bark_detector.h"
#include "../wifi_client/wifi_client.h"

static int16_t  sampleBuf[DMA_BUF_LEN];
static uint32_t lastBarkMs  = 0;
static int      peakVolume  = 0;

void setupI2S() {
  const i2s_config_t cfg = {
    .mode                 = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate          = SAMPLE_RATE,
    .bits_per_sample      = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format       = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags     = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count        = DMA_BUF_COUNT,
    .dma_buf_len          = DMA_BUF_LEN,
    .use_apll             = false,
  };
  const i2s_pin_config_t pins = {
    .bck_io_num   = I2S_SCK_PIN,
    .ws_io_num    = I2S_WS_PIN,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num  = I2S_SD_PIN,
  };
  i2s_driver_install(I2S_PORT, &cfg, 0, nullptr);
  i2s_set_pin(I2S_PORT, &pins);
}

void setup() {
  Serial.begin(115200);
  setupI2S();

  Serial.printf("Connecting to %s…\n", WIFI_SSID);
  if (!wifiConnect(WIFI_SSID, WIFI_PASSWORD)) {
    Serial.println("Wi-Fi failed — rebooting in 5 s");
    delay(5000);
    ESP.restart();
  }
  Serial.printf("Connected. IP: %s\n", WiFi.localIP().toString().c_str());
}

void loop() {
  size_t bytesRead = 0;
  i2s_read(I2S_PORT, sampleBuf, sizeof(sampleBuf), &bytesRead, portMAX_DELAY);

  const size_t count = bytesRead / sizeof(int16_t);
  const float  rms   = computeRms(sampleBuf, count);
  const uint32_t now = millis();

  // Track peak for this event window
  if (rms > peakVolume) peakVolume = static_cast<int>(rms);

  if (isBarkDetected(rms, BARK_RMS_THRESHOLD, lastBarkMs, now, BARK_COOLDOWN_MS)) {
    lastBarkMs = now;
    Serial.printf("Bark detected! RMS=%.1f peak=%d\n", rms, peakVolume);

    bool ok = postBarkEvent(API_HOST, API_PORT, API_ENDPOINT,
                            DEVICE_NAME, peakVolume, 5);
    Serial.printf("POST %s\n", ok ? "OK" : "FAILED");
    peakVolume = 0;
  }
}
