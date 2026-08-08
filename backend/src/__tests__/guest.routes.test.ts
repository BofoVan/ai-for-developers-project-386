import request from 'supertest';
import express from 'express';
import guestRoutes from '../routes/guest.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { store } from '../store/memoryStore.js';

const app = express();
app.use(express.json());
app.use('/api', guestRoutes);
app.use(errorHandler);

describe('Guest Routes', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('GET /api/event-types', () => {
    test('returns empty array initially', async () => {
      const res = await request(app).get('/api/event-types');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns seeded event types', async () => {
      store.createEventType({ name: 'Test', description: 'Desc', durationMinutes: 30 });
      const res = await request(app).get('/api/event-types');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Test');
    });
  });

  describe('GET /api/event-types/:eventTypeId/slots', () => {
    test('returns slots for existing event type', async () => {
      const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 30 });
      const res = await request(app)
        .get(`/api/event-types/${et.id}/slots`)
        .query({ from: '2026-08-10T00:00:00Z', to: '2026-08-10T23:59:59Z' });

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('start');
      expect(res.body[0]).toHaveProperty('end');
    });

    test('returns 404 for non-existent event type', async () => {
      const res = await request(app).get('/api/event-types/fake-id/slots');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('BOOKING_NOT_FOUND');
    });
  });

  describe('POST /api/bookings', () => {
    test('creates booking and returns 201', async () => {
      const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 30 });
      const res = await request(app)
        .post('/api/bookings')
        .send({
          eventTypeId: et.id,
          slotStart: '2026-08-10T09:00:00Z',
          guestName: 'Ivan',
          guestEmail: 'ivan@test.com',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(res.body.guestName).toBe('Ivan');
    });

    test('returns 409 when slot is already taken', async () => {
      const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 30 });
      await request(app)
        .post('/api/bookings')
        .send({
          eventTypeId: et.id,
          slotStart: '2026-08-10T09:00:00Z',
          guestName: 'First',
          guestEmail: 'first@test.com',
        });

      const res = await request(app)
        .post('/api/bookings')
        .send({
          eventTypeId: et.id,
          slotStart: '2026-08-10T09:00:00Z',
          guestName: 'Second',
          guestEmail: 'second@test.com',
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('SLOT_ALREADY_TAKEN');
    });

    test('returns 404 for non-existent event type', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          eventTypeId: '550e8400-e29b-41d4-a716-446655440000',
          slotStart: '2026-08-10T09:00:00Z',
          guestName: 'Ivan',
          guestEmail: 'ivan@test.com',
        });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('BOOKING_NOT_FOUND');
    });

    test('returns 400 for invalid body', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          eventTypeId: 'not-a-uuid',
          slotStart: 'invalid-date',
          guestName: '',
          guestEmail: 'not-an-email',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});
