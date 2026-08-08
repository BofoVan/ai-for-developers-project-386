import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BASE_URL = 'http://localhost:4010';
const ENV_FILE = fileURLToPath(new URL('../../.e2e-env.json', import.meta.url));

function getOrdinalSuffix(n: number): string {
  if (n > 3 && n < 21) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function formatDateLabel(d: Date): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const day = d.getUTCDate();
  return `${months[d.getUTCMonth()]} ${day}${getOrdinalSuffix(day)}`;
}

function formatIso(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNextWorkingDay(from: Date, daysAhead = 1): Date {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d;
}

async function waitForBackend(retries = 30, intervalMs = 1000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/event-types`);
      if (res.ok) return;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Backend did not become ready in time');
}

async function cleanup(): Promise<void> {
  const eventTypesRes = await fetch(`${BASE_URL}/admin/event-types`);
  if (eventTypesRes.ok) {
    const eventTypes = (await eventTypesRes.json()) as Array<{ id: string }>;
    for (const et of eventTypes) {
      await fetch(`${BASE_URL}/admin/event-types/${et.id}`, { method: 'DELETE' });
    }
  }

  const bookingsRes = await fetch(`${BASE_URL}/admin/bookings`);
  if (bookingsRes.ok) {
    const bookings = (await bookingsRes.json()) as Array<{ id: string }>;
    for (const b of bookings) {
      await fetch(`${BASE_URL}/admin/bookings/${b.id}`, { method: 'DELETE' });
    }
  }
}

async function seedEventTypes(): Promise<{
  consultation: { id: string };
  questions: { id: string };
}> {
  const consultationRes = await fetch(`${BASE_URL}/admin/event-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Консультация по проекту',
      description: 'Индивидуальная консультация для обсуждения деталей проекта',
      durationMinutes: 30,
    }),
  });
  const consultation = (await consultationRes.json()) as { id: string };

  const questionsRes = await fetch(`${BASE_URL}/admin/event-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Вопросы по проекту',
      description: 'Быстрый разбор вопросов и уточнений',
      durationMinutes: 15,
    }),
  });
  const questions = (await questionsRes.json()) as { id: string };

  return { consultation, questions };
}

async function seedBookings(eventTypeId: string, testDate: Date): Promise<void> {
  const booking1Date = getNextWorkingDay(testDate, 1);
  const booking2Date = getNextWorkingDay(booking1Date, 1);

  await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventTypeId,
      slotStart: `${formatIso(booking1Date)}T10:00:00Z`,
      guestName: 'Иван Петров',
      guestEmail: 'ivan@example.com',
    }),
  });

  await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventTypeId,
      slotStart: `${formatIso(booking2Date)}T14:00:00Z`,
      guestName: 'Мария Сидорова',
      guestEmail: 'maria@example.com',
    }),
  });
}

export async function setupBackendState(): Promise<void> {
  await waitForBackend();
  await cleanup();

  const { consultation } = await seedEventTypes();

  const today = new Date();
  const testDate = getNextWorkingDay(today, 1);

  await seedBookings(consultation.id, testDate);

  const env = {
    eventTypeId: consultation.id,
    eventTypeName: 'Консультация по проекту',
    testDateLabel: formatDateLabel(testDate),
    testDateIso: formatIso(testDate),
  };

  await fs.writeFile(ENV_FILE, JSON.stringify(env, null, 2));
  console.log('[E2E Setup] Backend state prepared:', env);
}

export async function cleanupBackendState(): Promise<void> {
  try {
    await waitForBackend(10, 500);
    await cleanup();
    await fs.unlink(ENV_FILE);
    console.log('[E2E Teardown] Backend state cleaned');
  } catch {
    // ignore
  }
}
