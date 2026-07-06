#pragma once
#include <cstdint>

/**
 * Computes the root-mean-square amplitude of a 16-bit PCM buffer.
 *
 * @param samples  Pointer to an array of int16_t samples.
 * @param count    Number of samples in the array.
 * @returns        RMS value as a float.
 */
float computeRms(const int16_t* samples, size_t count);

/**
 * Returns true when the RMS of the supplied buffer exceeds the threshold
 * AND the cooldown window has elapsed since the last detected event.
 *
 * @param rms            Current RMS value.
 * @param threshold      Detection threshold.
 * @param lastEventMs    Timestamp (ms) of the most recent detection.
 * @param nowMs          Current timestamp (ms).
 * @param cooldownMs     Minimum gap between events (ms).
 */
bool isBarkDetected(float rms, float threshold,
                    uint32_t lastEventMs, uint32_t nowMs,
                    uint32_t cooldownMs);
