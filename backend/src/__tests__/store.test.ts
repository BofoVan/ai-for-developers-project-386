import { MemoryStore, type EventType, type Booking } from '../store/memoryStore.js';

describe('MemoryStore', () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
    store.reset();
  });

  describe('Event Types', () => {
    test('createEventType assigns UUID and stores the type', () => {
      const et = store.createEventType({
        name: 'Test',
        description: 'Desc',
        durationMinutes: 45,
      });
      expect(et.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(et.name).toBe('Test');
      expect(store.listEventTypes()).toHaveLength(1);
    });

    test('listEventTypes returns empty array after reset', () => {
      expect(store.listEventTypes()).toEqual([]);
    });

    test('getEventType returns undefined for unknown id', () => {
      expect(store.getEventType('nonexistent')).toBeUndefined();
    });

    test('getEventType returns the correct type', () => {
      const et = store.createEventType({ name: 'A', description: 'B', durationMinutes: 10 });
      expect(store.getEventType(et.id)).toEqual(et);
    });

    test('deleteEventType removes existing type', () => {
      const et = store.createEventType({ name: 'A', description: 'B', durationMinutes: 10 });
      const result = store.deleteEventType(et.id);
      expect(result).toBe(true);
      expect(store.listEventTypes()).toHaveLength(0);
    });

    test('deleteEventType returns false for unknown id', () => {
      expect(store.deleteEventType('nonexistent')).toBe(false);
    });
  });

  describe('Bookings', () => {
    test('createBooking assigns UUID and stores the booking', () => {
      const b = store.createBooking({
        eventTypeId: 'et-1',
        slotStart: '2026-08-10T09:00:00Z',
        guestName: 'Ivan',
        guestEmail: 'ivan@test.com',
      });
      expect(b.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(b.guestName).toBe('Ivan');
      expect(store.listBookings()).toHaveLength(1);
    });

    test('listBookings returns all bookings', () => {
      store.createBooking({ eventTypeId: 'a', slotStart: '2026-08-10T09:00:00Z', guestName: 'A', guestEmail: 'a@a.com' });
      store.createBooking({ eventTypeId: 'b', slotStart: '2026-08-11T10:00:00Z', guestName: 'B', guestEmail: 'b@b.com' });
      expect(store.listBookings()).toHaveLength(2);
    });

    test('listBookings filters by from date', () => {
      store.createBooking({ eventTypeId: 'a', slotStart: '2026-08-10T09:00:00Z', guestName: 'A', guestEmail: 'a@a.com' });
      store.createBooking({ eventTypeId: 'b', slotStart: '2026-08-15T10:00:00Z', guestName: 'B', guestEmail: 'b@b.com' });
      const result = store.listBookings({ from: new Date('2026-08-12T00:00:00Z') });
      expect(result).toHaveLength(1);
      expect(result[0].guestName).toBe('B');
    });

    test('listBookings filters by to date', () => {
      store.createBooking({ eventTypeId: 'a', slotStart: '2026-08-10T09:00:00Z', guestName: 'A', guestEmail: 'a@a.com' });
      store.createBooking({ eventTypeId: 'b', slotStart: '2026-08-15T10:00:00Z', guestName: 'B', guestEmail: 'b@b.com' });
      const result = store.listBookings({ to: new Date('2026-08-12T00:00:00Z') });
      expect(result).toHaveLength(1);
      expect(result[0].guestName).toBe('A');
    });

    test('deleteBooking removes existing booking', () => {
      const b = store.createBooking({ eventTypeId: 'a', slotStart: '2026-08-10T09:00:00Z', guestName: 'A', guestEmail: 'a@a.com' });
      const result = store.deleteBooking(b.id);
      expect(result).toBe(true);
      expect(store.listBookings()).toHaveLength(0);
    });

    test('deleteBooking returns false for unknown id', () => {
      expect(store.deleteBooking('nonexistent')).toBe(false);
    });
  });

  describe('isSlotTaken', () => {
    beforeEach(() => {
      store.createEventType({ name: '30min', description: 'x', durationMinutes: 30 });
      store.createEventType({ name: '15min', description: 'y', durationMinutes: 15 });
    });

    test('returns false when no bookings exist', () => {
      expect(store.isSlotTaken(new Date('2026-08-10T09:00:00Z'), 30)).toBe(false);
    });

    test('returns true when slot exactly matches existing booking', () => {
      const et = store.listEventTypes()[0];
      store.createBooking({
        eventTypeId: et.id,
        slotStart: '2026-08-10T09:00:00Z',
        guestName: 'A',
        guestEmail: 'a@a.com',
      });
      expect(store.isSlotTaken(new Date('2026-08-10T09:00:00Z'), 30)).toBe(true);
    });

    test('returns true for overlapping slot (different duration)', () => {
      const et30 = store.listEventTypes()[0];
      const et15 = store.listEventTypes()[1];
      store.createBooking({
        eventTypeId: et30.id,
        slotStart: '2026-08-10T09:00:00Z',
        guestName: 'A',
        guestEmail: 'a@a.com',
      });
      // 15min slot starting at 09:15 overlaps with 09:00-09:30
      expect(store.isSlotTaken(new Date('2026-08-10T09:15:00Z'), 15)).toBe(true);
    });

    test('returns false when slot ends exactly when booking starts', () => {
      const et = store.listEventTypes()[0];
      store.createBooking({
        eventTypeId: et.id,
        slotStart: '2026-08-10T09:30:00Z',
        guestName: 'A',
        guestEmail: 'a@a.com',
      });
      // 09:00-09:30 does not overlap with 09:30-10:00
      expect(store.isSlotTaken(new Date('2026-08-10T09:00:00Z'), 30)).toBe(false);
    });

    test('returns false when slot starts exactly when booking ends', () => {
      const et = store.listEventTypes()[0];
      store.createBooking({
        eventTypeId: et.id,
        slotStart: '2026-08-10T09:00:00Z',
        guestName: 'A',
        guestEmail: 'a@a.com',
      });
      // 09:30-10:00 does not overlap with 09:00-09:30
      expect(store.isSlotTaken(new Date('2026-08-10T09:30:00Z'), 30)).toBe(false);
    });
  });
});
