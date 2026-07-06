const mongoose = require('mongoose');

const barkEventSchema = new mongoose.Schema(
  {
    device: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    peakVolume: {
      type: Number,
      required: true,
      min: 0,
      // No upper bound — raw RMS amplitude from ESP32 is not percentage-based
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    audioPath: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BarkEvent', barkEventSchema);
