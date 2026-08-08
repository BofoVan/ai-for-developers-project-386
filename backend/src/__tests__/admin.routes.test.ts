import request from 'supertest';
import express from 'express';
import adminRoutes from '../routes/admin.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { store } from '../store/memoryStore.js';

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);
app.use(errorHandler);

describe('Admin Routes', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('GET /admin/event-types', () => {
    test('returns empty array initially', async () => {
      const res = await request(app).get('/admin/event-types');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns created event types', async () => {
      await request(app)
        .post('/admin/event-types')
        .send({ name: 'Test', description: 'Desc', durationMinutes: 30 });

      const res = await request(app).get('/admin/event-types');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Test');
    });
  });

  describe('POST /admin/event-types', () => {
    test('creates event type and returns 201', async () => {
      const res = await request(app)
        .post('/admin/event-types')
        .send({ name: 'New Type', description: 'Desc', durationMinutes: 45 });

      expect(res.status).toBe(201);
      expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(res.body.name).toBe('New Type');
      expect(res.body.durationMinutes).toBe(45);
    });

    test('returns 400 for invalid body', async () => {
      const res = await request(app)
        .post('/admin/event-types')
        .send({ name: '', description: '', durationMinutes: 0 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('DELETE /admin/event-types/:eventTypeId', () => {
    test('deletes existing event type', async () => {
      const createRes = await request(app)
        .post('/admin/event-types')
        .send({ name: 'ToDelete', description: 'x', durationMinutes: 30 });

      const id = createRes.body.id;
      const res = await request(app).delete(`/admin/event-types/${id}`);
      expect(res.status).toBe(204);

      const listRes = await request(app).get('/admin/event-types');
      expect(listRes.body).toHaveLength(0);
    });

    test('returns 404 for non-existent id', async () => {
      const res = await request(app).delete('/admin/event-types/fake-id');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('BOOKING_NOT_FOUND');
    });
  });

  describe('GET /admin/bookings', () => {
    test('returns empty array initially', async () => {
      const res = await request(app).get('/admin/bookings');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns bookings with filter', async () => {
      const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 30 });
      store.createBooking({
        eventTypeId: et.id,
        slotStart: '2026-08-10T09:00:00Z',
        guestName: 'A',
        guestEmail: 'a@a.com',
      });
      store.createBooking({
        eventTypeId: et.id,
        slotStart: '2026-08-15T10:00:00Z',
        guestName: 'B',
        guestEmail: 'b@b.com',
      });

      const res = await request(app)
        .get('/admin/bookings')
        .query({ from: '2026-08-12T00:00:00Z', to: '2026-08-20T23:59:59Z' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].guestName).toBe('B');
    });
  });

  describe('DELETE /admin/bookings/:bookingId', () => {
    test('deletes existing booking', async () => {
      const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 30 });
      const booking = store.createBooking({
        eventTypeId: et.id,
        slotStart: '2026-08-10T09:00:00Z',
        guestName: 'A',
        guestEmail: 'a@a.com',
      });

      const res = await request(app).delete(`/admin/bookings/${booking.id}`);
      expect(res.status).toBe(204);
    });

    test('returns 404 for non-existent id', async () => {
      const res = await request(app).delete('/admin/bookings/fake-id');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('BOOKING_NOT_FOUND');
    });
  });
});
