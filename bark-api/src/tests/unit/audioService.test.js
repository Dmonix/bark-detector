const path = require('path');
const fs   = require('fs');
const os   = require('os');

// Point audio storage at a temp dir so tests don't litter the repo
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bark-test-'));
process.env.AUDIO_STORAGE_PATH = tmpDir;

const { buildAudioPath } = require('../../backend/services/audioService');

describe('audioService.buildAudioPath', () => {
  const timestamp = new Date('2026-06-26T18:14:22Z');
  const device    = 'living-room';

  let result;
  beforeAll(() => {
    result = buildAudioPath(timestamp, device);
  });

  it('returns a relative path starting with /audio', () => {
    expect(result.relativePath.startsWith('/audio')).toBe(true);
  });

  it('partitions by year/month/day', () => {
    expect(result.relativePath).toContain('/2026/06/26/');
  });

  it('slugifies the device name in the filename', () => {
    expect(result.relativePath).toContain('living_room');
  });

  it('includes the time in the filename', () => {
    expect(result.relativePath).toContain('181422');
  });

  it('creates the directory on disk', () => {
    const dir = path.dirname(result.absolutePath);
    expect(fs.existsSync(dir)).toBe(true);
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
