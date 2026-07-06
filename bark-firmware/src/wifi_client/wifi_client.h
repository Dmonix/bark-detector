#pragma once

/**
 * Connects to Wi-Fi. Blocks until connected or timeout.
 * @param ssid       Network SSID.
 * @param password   Network password.
 * @param timeoutMs  Maximum wait in milliseconds (default 10 s).
 * @returns true on success.
 */
bool wifiConnect(const char* ssid, const char* password, uint32_t timeoutMs = 10000);

/**
 * Posts a JSON bark event (no audio) to the REST API.
 *
 * @param host        API hostname or IP.
 * @param port        API port.
 * @param endpoint    API path, e.g. "/api/bark".
 * @param device      Device identifier string.
 * @param peakVolume  Detected peak volume.
 * @param duration    Clip duration in seconds.
 * @returns true on HTTP 2xx.
 */
bool postBarkEvent(const char* host, uint16_t port, const char* endpoint,
                   const char* device, int peakVolume, int duration);
