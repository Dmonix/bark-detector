const fs = require('fs');
const BarkEvent = require('../models/BarkEvent');
const { buildAudioPath } = require('../services/audioService');

/**
 * POST /api/bark
 * Accepts multipart/form-data with optional audio file.
 */
const createBarkEvent = async (req, res) => {
  try {
    const { device, timestamp, peakVolume, duration } = req.body;

    // Use explicit undefined/null checks so numeric 0 doesn't falsely fail
    if (!device || peakVolume == null || peakVolume === '' || duration == null || duration === '') {
      return res.status(400).json({ error: 'device, peakVolume, and duration are required.' });
    }

    const parsedPeak = Number(peakVolume);
    const parsedDuration = Number(duration);

    if (isNaN(parsedPeak) || parsedPeak < 0) {
      return res.status(400).json({ error: 'peakVolume must be a non-negative number.' });
    }
    if (isNaN(parsedDuration) || parsedDuration < 0) {
      return res.status(400).json({ error: 'duration must be a non-negative number.' });
    }

    const eventTimestamp = timestamp ? new Date(timestamp) : new Date();
    if (isNaN(eventTimestamp.getTime())) {
      return res.status(400).json({ error: 'timestamp must be a valid ISO 8601 date string.' });
    }

    let audioPath = null;
    if (req.file) {
      const { relativePath, absolutePath } = buildAudioPath(eventTimestamp, device);
      fs.renameSync(req.file.path, absolutePath);
      audioPath = relativePath;
    }

    const event = await BarkEvent.create({
      device,
      timestamp: eventTimestamp,
      peakVolume: parsedPeak,
      duration: parsedDuration,
      audioPath,
    });

    return res.status(201).json(event);
  } catch (err) {
    console.error('createBarkEvent error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * GET /api/bark
 * Returns paginated bark events, optionally filtered by device.
 */
const getBarkEvents = async (req, res) => {
  try {
    const { device, page = 1, limit = 50 } = req.query;
    const filter = device ? { device } : {};

    const events = await BarkEvent.find(filter)
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await BarkEvent.countDocuments(filter);

    return res.json({ total, page: Number(page), limit: Number(limit), events });
  } catch (err) {
    console.error('getBarkEvents error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * GET /api/bark/:id
 * Returns a single bark event by its MongoDB _id.
 */
const getBarkEventById = async (req, res) => {
  try {
    const event = await BarkEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Bark event not found.' });
    }
    return res.json(event);
  } catch (err) {
    // Mongoose throws a CastError for malformed ObjectIds
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid event ID format.' });
    }
    console.error('getBarkEventById error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { createBarkEvent, getBarkEvents, getBarkEventById };
