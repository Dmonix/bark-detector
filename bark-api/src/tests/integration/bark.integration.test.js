/**
 * Integration tests for POST /api/bark and GET /api/bark
 *
 * Uses mongodb-memory-server so no real MongoDB instance is needed.
 * Install: npm install --save-dev mongodb-memory-server
 */
const request  = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../backend/app');
const { connect, disconnect } = require('../../database/connection');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connect(mongod.getUri());
});

afterAll(async () => {
  await disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Clear all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ─── POST /api/bark ───────────────────────────────────────────────────────────

describe('POST /api/bark', () => {
  const validPayload = {
    device:      'living-room',
    timestamp:   '2026-06-26T18:14:22Z',
    peakVolume:  '82',
    duration:    '5',
  };

  it('returns 201 and the created event for a valid payload', async () => {
    const res = await request(app)
      .post('/api/bark')
      .field('device',     validPayload.device)
      .field('timestamp',  validPayload.timestamp)
      .field('peakVolume', validPayload.peakVolume)
      .field('duration',   validPayload.duration);

    expect(res.status).toBe(201);
    expect(res.body.device).toBe('living-room');
    expect(res.body.peakVolume).toBe(82);
    expect(res.body._id).toBeDefined();
  });

  it('persists the event so it is retrievable via GET', async () => {
    await request(app)
      .post('/api/bark')
      .field('device',     validPayload.device)
      .field('peakVolume', validPayload.peakVolume)
      .field('duration',   validPayload.duration);

    const res = await request(app).get('/api/bark');
    expect(res.body.total).toBe(1);
    expect(res.body.events[0].device).toBe('living-room');
  });

  it('returns 400 when device is missing', async () => {
    const res = await request(app)
      .post('/api/bark')
      .field('peakVolume', '82')
      .field('duration',   '5');
    expect(res.status).toBe(400);
  });

  it('returns 400 when peakVolume is non-numeric', async () => {
    const res = await request(app)
      .post('/api/bark')
      .field('device',     'garden')
      .field('peakVolume', 'loud')
      .field('duration',   '5');
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid timestamp', async () => {
    const res = await request(app)
      .post('/api/bark')
      .field('device',     'garden')
      .field('peakVolume', '75')
      .field('duration',   '5')
      .field('timestamp',  'not-a-date');
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/bark ────────────────────────────────────────────────────────────

describe('GET /api/bark', () => {
  beforeEach(async () => {
    // Seed two events from different devices
    await request(app).post('/api/bark')
      .field('device', 'hall').field('peakVolume', '60').field('duration', '5');
    await request(app).post('/api/bark')
      .field('device', 'garden').field('peakVolume', '90').field('duration', '5');
  });

  it('returns all events', async () => {
    const res = await request(app).get('/api/bark');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });

  it('filters events by device', async () => {
    const res = await request(app).get('/api/bark?device=hall');
    expect(res.body.total).toBe(1);
    expect(res.body.events[0].device).toBe('hall');
  });

  it('respects limit param', async () => {
    const res = await request(app).get('/api/bark?limit=1');
    expect(res.body.events.length).toBe(1);
  });
});

// ─── GET /api/bark/:id ────────────────────────────────────────────────────────

describe('GET /api/bark/:id', () => {
  it('returns the event for a valid id', async () => {
    const post = await request(app).post('/api/bark')
      .field('device', 'kitchen').field('peakVolume', '70').field('duration', '5');
    const id = post.body._id;

    const res = await request(app).get(`/api/bark/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.device).toBe('kitchen');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/bark/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('returns 400 for a malformed id', async () => {
    const res = await request(app).get('/api/bark/not-a-valid-id');
    expect(res.status).toBe(400);
  });
});

// ─── GET /health ──────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
