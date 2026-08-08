import { Router } from 'express';
import { z } from 'zod';
import { store } from '../store/memoryStore.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

const EventTypeCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  durationMinutes: z.number().int().min(1),
});

// GET /admin/event-types
router.get('/event-types', (_req, res) => {
  res.json(store.listEventTypes());
});

// POST /admin/event-types
router.post('/event-types', (req, res) => {
  const parsed = EventTypeCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'INTERNAL_SERVER_ERROR', 'Invalid request body');
  }
  const eventType = store.createEventType(parsed.data);
  res.status(201).json(eventType);
});

// DELETE /admin/event-types/:eventTypeId
router.delete('/event-types/:eventTypeId', (req, res) => {
  const { eventTypeId } = req.params;
  const deleted = store.deleteEventType(eventTypeId);
  if (!deleted) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Event type not found');
  }
  res.status(204).send();
});

// GET /admin/bookings
router.get('/bookings', (req, res) => {
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;
  res.json(store.listBookings({ from, to }));
});

// DELETE /admin/bookings/:bookingId
router.delete('/bookings/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  const deleted = store.deleteBooking(bookingId);
  if (!deleted) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
  }
  res.status(204).send();
});

export default router;
