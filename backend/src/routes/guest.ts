import { Router } from 'express';
import { z } from 'zod';
import { store } from '../store/memoryStore.js';
import { generateSlots } from '../utils/slots.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

const BookingRequestSchema = z.object({
  eventTypeId: z.string().uuid(),
  slotStart: z.string().datetime(),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
});

// GET /api/event-types
router.get('/event-types', (_req, res) => {
  res.json(store.listEventTypes());
});

// GET /api/event-types/:eventTypeId/slots
router.get('/event-types/:eventTypeId/slots', (req, res) => {
  const { eventTypeId } = req.params;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;

  const slots = generateSlots(eventTypeId, from, to);
  if (slots === null) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Event type not found');
  }

  res.json(slots);
});

// POST /api/bookings
router.post('/bookings', (req, res) => {
  const parsed = BookingRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'INTERNAL_SERVER_ERROR', 'Invalid request body');
  }

  const data = parsed.data;
  const eventType = store.getEventType(data.eventTypeId);
  if (!eventType) {
    throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Event type not found');
  }

  const slotStart = new Date(data.slotStart);
  if (store.isSlotTaken(slotStart, eventType.durationMinutes)) {
    throw new ApiError(409, 'SLOT_ALREADY_TAKEN', 'Selected slot is already taken');
  }

  const booking = store.createBooking(data);
  res.status(201).json(booking);
});

export default router;
