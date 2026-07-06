#include "wifi_client.h"
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

bool wifiConnect(const char* ssid, const char* password, uint32_t timeoutMs) {
  WiFi.begin(ssid, password);
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > timeoutMs) return false;
    delay(500);
  }
  return true;
}

bool postBarkEvent(const char* host, uint16_t port, const char* endpoint,
                   const char* device, int peakVolume, int duration) {
  HTTPClient http;
  String url = String("http://") + host + ":" + port + endpoint;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["device"]      = device;
  doc["peakVolume"]  = peakVolume;
  doc["duration"]    = duration;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  http.end();
  return (code >= 200 && code < 300);
}
