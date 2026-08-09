import { store, type EventType } from '../store/memoryStore.js';

export interface Slot {
  start: string;
  end: string;
  isAvailable: boolean;
}

export function generateSlots(
  eventTypeId: string,
  fromParam?: string,
  toParam?: string
): Slot[] | null {
  const eventType = store.getEventType(eventTypeId);
  if (!eventType) return null;

  const now = new Date();
  const from = fromParam ? new Date(fromParam) : now;
  const to = toParam
    ? new Date(toParam)
    : new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000);

  const slots: Slot[] = [];
  const durationMs = eventType.durationMinutes * 60000;

  // Iterate day by day
  const current = new Date(from);
  current.setUTCHours(0, 0, 0, 0);

  while (current <= to) {
    const dayOfWeek = current.getUTCDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Work hours: 09:00 - 18:00 UTC
      const dayStart = new Date(Date.UTC(
        current.getUTCFullYear(),
        current.getUTCMonth(),
        current.getUTCDate(),
        9, 0, 0
      ));
      const dayEnd = new Date(Date.UTC(
        current.getUTCFullYear(),
        current.getUTCMonth(),
        current.getUTCDate(),
        18, 0, 0
      ));

      let slotStart = new Date(dayStart);
      while (slotStart < dayEnd) {
        const slotEnd = new Date(slotStart.getTime() + durationMs);
        if (slotEnd > dayEnd) break;

        if (slotStart >= from && slotStart <= to) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            isAvailable: !store.isSlotTaken(slotStart, eventType.durationMinutes),
          });
        }

        slotStart = new Date(slotStart.getTime() + durationMs);
      }
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return slots;
}
