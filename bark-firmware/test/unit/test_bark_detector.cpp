#include <unity.h>
#include "../../src/bark_detector/bark_detector.h"

void test_rms_zero_on_empty_buffer() {
  TEST_ASSERT_EQUAL_FLOAT(0.0f, computeRms(nullptr, 0));
}

void test_rms_of_silence() {
  int16_t buf[8] = {0};
  TEST_ASSERT_EQUAL_FLOAT(0.0f, computeRms(buf, 8));
}

void test_rms_known_value() {
  // All samples = 100  →  RMS = 100
  int16_t buf[4] = {100, 100, 100, 100};
  TEST_ASSERT_FLOAT_WITHIN(0.01f, 100.0f, computeRms(buf, 4));
}

void test_rms_mixed_sign() {
  // ±100 → RMS still = 100
  int16_t buf[4] = {100, -100, 100, -100};
  TEST_ASSERT_FLOAT_WITHIN(0.01f, 100.0f, computeRms(buf, 4));
}

void test_bark_not_detected_below_threshold() {
  TEST_ASSERT_FALSE(isBarkDetected(100.0f, 500.0f, 0, 5000, 3000));
}

void test_bark_detected_above_threshold_after_cooldown() {
  TEST_ASSERT_TRUE(isBarkDetected(600.0f, 500.0f, 0, 5000, 3000));
}

void test_bark_suppressed_within_cooldown() {
  // lastEvent=1000, now=2000 → gap=1000 < cooldown=3000
  TEST_ASSERT_FALSE(isBarkDetected(600.0f, 500.0f, 1000, 2000, 3000));
}

int main(int argc, char** argv) {
  UNITY_BEGIN();
  RUN_TEST(test_rms_zero_on_empty_buffer);
  RUN_TEST(test_rms_of_silence);
  RUN_TEST(test_rms_known_value);
  RUN_TEST(test_rms_mixed_sign);
  RUN_TEST(test_bark_not_detected_below_threshold);
  RUN_TEST(test_bark_detected_above_threshold_after_cooldown);
  RUN_TEST(test_bark_suppressed_within_cooldown);
  UNITY_END();
  return 0;
}
