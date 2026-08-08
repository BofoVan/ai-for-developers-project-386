import { generateSlots } from '../utils/slots.js';
import { store } from '../store/memoryStore.js';

describe('generateSlots', () => {
  beforeEach(() => {
    store.reset();
  });

  test('returns null for non-existent event type', () => {
    expect(generateSlots('nonexistent-id')).toBeNull();
  });

  test('generates slots for a workday', () => {
    const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 30 });
    const slots = generateSlots(et.id, '2026-08-10T00:00:00Z', '2026-08-10T23:59:59Z');
    expect(slots).not.toBeNull();
    expect(slots!.length).toBeGreaterThan(0);
    expect(slots![0].start).toBe('2026-08-10T09:00:00.000Z');
    expect(slots![slots!.length - 1].end).toBe('2026-08-10T18:00:00.000Z');
  });

  test('does not generate slots on Saturday', () => {
    const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 30 });
    // 2026-08-08 is Saturday
    const slots = generateSlots(et.id, '2026-08-08T00:00:00Z', '2026-08-08T23:59:59Z');
    expect(slots).toEqual([]);
  });

  test('does not generate slots on Sunday', () => {
    const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 30 });
    // 2026-08-09 is Sunday
    const slots = generateSlots(et.id, '2026-08-09T00:00:00Z', '2026-08-09T23:59:59Z');
    expect(slots).toEqual([]);
  });

  test('excludes taken slots', () => {
    const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 30 });
    store.createBooking({
      eventTypeId: et.id,
      slotStart: '2026-08-10T09:00:00Z',
      guestName: 'A',
      guestEmail: 'a@a.com',
    });
    const slots = generateSlots(et.id, '2026-08-10T00:00:00Z', '2026-08-10T23:59:59Z');
    const hasNineAm = slots!.some((s) => s.start === '2026-08-10T09:00:00.000Z');
    expect(hasNineAm).toBe(false);
    expect(slots!.length).toBe(17); // 18 total - 1 taken
  });

  test('uses default 14-day range when from/to not provided', () => {
    const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 60 });
    const now = new Date();
    const slots = generateSlots(et.id);
    expect(slots).not.toBeNull();
    if (slots && slots.length > 0) {
      const firstSlot = new Date(slots[0].start);
      const lastSlot = new Date(slots[slots.length - 1].start);
      const daysDiff = (lastSlot.getTime() - firstSlot.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeLessThanOrEqual(14);
    }
  });

  test('respects step based on durationMinutes', () => {
    const et15 = store.createEventType({ name: '15min', description: 'x', durationMinutes: 15 });
    const et60 = store.createEventType({ name: '60min', description: 'x', durationMinutes: 60 });

    const slots15 = generateSlots(et15.id, '2026-08-10T00:00:00Z', '2026-08-10T23:59:59Z');
    const slots60 = generateSlots(et60.id, '2026-08-10T00:00:00Z', '2026-08-10T23:59:59Z');

    expect(slots15!.length).toBe(36); // 9 hours / 15 min = 36
    expect(slots60!.length).toBe(9);  // 9 hours / 60 min = 9
  });

  test('does not generate slot that exceeds workday', () => {
    const et = store.createEventType({ name: 'Test', description: 'x', durationMinutes: 45 });
    const slots = generateSlots(et.id, '2026-08-10T00:00:00Z', '2026-08-10T23:59:59Z');
    const lastSlot = slots![slots!.length - 1];
    expect(lastSlot.end).toBe('2026-08-10T18:00:00.000Z');
  });
});
