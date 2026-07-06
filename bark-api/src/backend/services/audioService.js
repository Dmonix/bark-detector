const path = require('path');
const fs = require('fs');

/**
 * Builds a date-partitioned audio file path and ensures
 * the directory exists.
 *
 * @param {Date} timestamp
 * @param {string} device
 * @returns {{ relativePath: string, absolutePath: string }}
 */
const buildAudioPath = (timestamp, device) => {
  const date = new Date(timestamp);
  const year  = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day   = String(date.getUTCDate()).padStart(2, '0');
  const time  = `${String(date.getUTCHours()).padStart(2,'0')}` +
                `${String(date.getUTCMinutes()).padStart(2,'0')}` +
                `${String(date.getUTCSeconds()).padStart(2,'0')}`;

  const slug = device.replace(/[^a-z0-9]/gi, '_');
  const filename = `bark_${slug}_${time}.wav`;
  const relativePath = path.join('/audio', String(year), month, day, filename);

  const storagePath = process.env.AUDIO_STORAGE_PATH || './audio';
  const absoluteDir = path.join(storagePath, String(year), month, day);
  fs.mkdirSync(absoluteDir, { recursive: true });

  const absolutePath = path.join(absoluteDir, filename);
  return { relativePath, absolutePath };
};

module.exports = { buildAudioPath };
