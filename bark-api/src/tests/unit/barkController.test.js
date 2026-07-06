const { createBarkEvent, getBarkEvents, getBarkEventById } = require('../../backend/controllers/barkController');

jest.mock('../../backend/models/BarkEvent');
jest.mock('../../backend/services/audioService');

const BarkEvent = require('../../backend/models/BarkEvent');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// ─── createBarkEvent ──────────────────────────────────────────────────────────

describe('barkController.createBarkEvent', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when device is missing', async () => {
    const req = { body: { peakVolume: '75', duration: '5' }, file: null };
    const res = mockRes();
    await createBarkEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when peakVolume is missing', async () => {
    const req = { body: { device: 'garden', duration: '5' }, file: null };
    const res = mockRes();
    await createBarkEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when duration is missing', async () => {
    const req = { body: { device: 'garden', peakVolume: '75' }, file: null };
    const res = mockRes();
    await createBarkEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('accepts peakVolume of 0 without rejecting (falsy-zero guard)', async () => {
    const fakeEvent = { _id: 'x1', device: 'hall', peakVolume: 0, duration: 5 };
    BarkEvent.create = jest.fn().mockResolvedValue(fakeEvent);
    const req = { body: { device: 'hall', peakVolume: '0', duration: '5' }, file: null };
    const res = mockRes();
    await createBarkEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 400 for a non-numeric peakVolume', async () => {
    const req = { body: { device: 'garden', peakVolume: 'loud', duration: '5' }, file: null };
    const res = mockRes();
    await createBarkEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for an invalid timestamp', async () => {
    const req = { body: { device: 'garden', peakVolume: '75', duration: '5', timestamp: 'not-a-date' }, file: null };
    const res = mockRes();
    await createBarkEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates and returns a bark event without audio', async () => {
    const fakeEvent = { _id: 'abc123', device: 'garden', peakVolume: 75, duration: 5 };
    BarkEvent.create = jest.fn().mockResolvedValue(fakeEvent);
    const req = { body: { device: 'garden', peakVolume: '75', duration: '5' }, file: null };
    const res = mockRes();
    await createBarkEvent(req, res);
    expect(BarkEvent.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeEvent);
  });

  it('stores audioPath when a file is uploaded', async () => {
    const { buildAudioPath } = require('../../backend/services/audioService');
    buildAudioPath.mockReturnValue({
      relativePath: '/audio/2026/06/26/bark_garden_181422.wav',
      absolutePath: '/tmp/bark/2026/06/26/bark_garden_181422.wav',
    });

    // Mock fs.renameSync so we don't touch the filesystem
    jest.spyOn(require('fs'), 'renameSync').mockImplementation(() => {});

    const fakeEvent = { _id: 'abc456', audioPath: '/audio/2026/06/26/bark_garden_181422.wav' };
    BarkEvent.create = jest.fn().mockResolvedValue(fakeEvent);

    const req = {
      body: { device: 'garden', peakVolume: '75', duration: '5' },
      file: { path: '/tmp/upload/abc' },
    };
    const res = mockRes();
    await createBarkEvent(req, res);

    const createCall = BarkEvent.create.mock.calls[0][0];
    expect(createCall.audioPath).toBe('/audio/2026/06/26/bark_garden_181422.wav');
  });

  it('returns 500 on unexpected errors', async () => {
    BarkEvent.create = jest.fn().mockRejectedValue(new Error('DB down'));
    const req = { body: { device: 'garden', peakVolume: '75', duration: '5' }, file: null };
    const res = mockRes();
    await createBarkEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── getBarkEvents ────────────────────────────────────────────────────────────

describe('barkController.getBarkEvents', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns paginated events', async () => {
    const fakeEvents = [{ device: 'hall', peakVolume: 60 }];
    BarkEvent.find = jest.fn().mockReturnValue({
      sort:  jest.fn().mockReturnThis(),
      skip:  jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(fakeEvents),
    });
    BarkEvent.countDocuments = jest.fn().mockResolvedValue(1);

    const req = { query: {} };
    const res = mockRes();
    await getBarkEvents(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ total: 1, events: fakeEvents })
    );
  });

  it('filters by device when query param is provided', async () => {
    BarkEvent.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });
    BarkEvent.countDocuments = jest.fn().mockResolvedValue(0);

    const req = { query: { device: 'garden' } };
    const res = mockRes();
    await getBarkEvents(req, res);
    expect(BarkEvent.find).toHaveBeenCalledWith({ device: 'garden' });
  });
});

// ─── getBarkEventById ─────────────────────────────────────────────────────────

describe('barkController.getBarkEventById', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the event when found', async () => {
    const fakeEvent = { _id: 'abc123', device: 'garden' };
    BarkEvent.findById = jest.fn().mockResolvedValue(fakeEvent);

    const req = { params: { id: 'abc123' } };
    const res = mockRes();
    await getBarkEventById(req, res);
    expect(res.json).toHaveBeenCalledWith(fakeEvent);
  });

  it('returns 404 when event is not found', async () => {
    BarkEvent.findById = jest.fn().mockResolvedValue(null);

    const req = { params: { id: 'abc123' } };
    const res = mockRes();
    await getBarkEventById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 for a malformed ObjectId', async () => {
    const castError = new Error('Cast error');
    castError.name = 'CastError';
    BarkEvent.findById = jest.fn().mockRejectedValue(castError);

    const req = { params: { id: 'not-valid' } };
    const res = mockRes();
    await getBarkEventById(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
