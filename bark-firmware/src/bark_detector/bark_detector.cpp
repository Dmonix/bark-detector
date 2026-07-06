#include "bark_detector.h"
#include <cmath>

float computeRms(const int16_t* samples, size_t count) {
  if (count == 0) return 0.0f;
  double sum = 0.0;
  for (size_t i = 0; i < count; ++i) {
    sum += static_cast<double>(samples[i]) * samples[i];
  }
  return static_cast<float>(std::sqrt(sum / count));
}

bool isBarkDetected(float rms, float threshold,
                    uint32_t lastEventMs, uint32_t nowMs,
                    uint32_t cooldownMs) {
  if (rms < threshold) return false;
  return (nowMs - lastEventMs) >= cooldownMs;
}
