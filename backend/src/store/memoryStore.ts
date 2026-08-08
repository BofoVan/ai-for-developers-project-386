export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  slotStart: string;
  guestName: string;
  guestEmail: string;
}

export class MemoryStore {
  eventTypes: EventType[] = [];
  bookings: Booking[] = [];

  constructor() {
    // Seed data
    this.eventTypes.push(
      {
        id: crypto.randomUUID(),
        name: 'Консультация',
        description: 'Индивидуальная консультация для обсуждения деталей',
        durationMinutes: 30,
      },
      {
        id: crypto.randomUUID(),
        name: 'Вопросы по проекту',
        description: 'Быстрый разбор вопросов и уточнений',
        durationMinutes: 15,
      }
    );
  }

  createEventType(data: Omit<EventType, 'id'>): EventType {
    const eventType: EventType = { id: crypto.randomUUID(), ...data };
    this.eventTypes.push(eventType);
    return eventType;
  }

  listEventTypes(): EventType[] {
    return this.eventTypes;
  }

  getEventType(id: string): EventType | undefined {
    return this.eventTypes.find((et) => et.id === id);
  }

  deleteEventType(id: string): boolean {
    const idx = this.eventTypes.findIndex((et) => et.id === id);
    if (idx === -1) return false;
    this.eventTypes.splice(idx, 1);
    return true;
  }

  createBooking(data: Omit<Booking, 'id'>): Booking {
    const booking: Booking = { id: crypto.randomUUID(), ...data };
    this.bookings.push(booking);
    return booking;
  }

  listBookings(filter?: { from?: Date; to?: Date }): Booking[] {
    let result = this.bookings;
    if (filter?.from) {
      result = result.filter((b) => new Date(b.slotStart) >= filter.from!);
    }
    if (filter?.to) {
      result = result.filter((b) => new Date(b.slotStart) <= filter.to!);
    }
    return result;
  }

  deleteBooking(id: string): boolean {
    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.bookings.splice(idx, 1);
    return true;
  }

  reset(): void {
    this.eventTypes = [];
    this.bookings = [];
  }

  isSlotTaken(slotStart: Date, durationMinutes: number): boolean {
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
    return this.bookings.some((b) => {
      const bStart = new Date(b.slotStart);
      const bEventType = this.getEventType(b.eventTypeId);
      const bDuration = bEventType?.durationMinutes ?? 30;
      const bEnd = new Date(bStart.getTime() + bDuration * 60000);
      return slotStart < bEnd && slotEnd > bStart;
    });
  }
}

export const store = new MemoryStore();
