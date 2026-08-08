import { test, expect } from './setup/fixtures.js';

function getYesterdayLabel(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
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
  const day = yesterday.getDate();
  const suffix =
    ((d: number) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    })(day);
  return `${months[yesterday.getMonth()]} ${day}${suffix}`;
}

function getCard(page) {
  return page
    .locator('div')
    .filter({ has: page.getByText('Консультация по проекту', { exact: true }) })
    .locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');
}

test.describe('BookingPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/book');
  });

  test('renders 3-column layout with calendar always visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Запись на встречу' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Тип встречи' })).toBeVisible();
    await expect(page.getByText('Консультация по проекту')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Календарь' })).toBeVisible();
    await expect(page.getByRole('grid', { name: /August \d{4}/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Доступные слоты/ })).toBeVisible();
    await expect(page.getByText('Выберите тип встречи слева', { exact: true })).toBeVisible();
  });

  test('selecting event type highlights the card', async ({ page }) => {
    const card = getCard(page);
    await card.click();
    await expect(card).toHaveClass(/border-primary/);
    await expect(page.getByText('Выберите дату в календаре')).toBeVisible();
  });

  test('past dates are disabled in calendar', async ({ page }) => {
    const card = getCard(page);
    await card.click();
    const label = getYesterdayLabel();
    const pastDate = page.getByRole('button', { name: new RegExp(label) });
    await expect(pastDate).toBeDisabled();
  });

  test('selecting date loads available slots', async ({ page, e2eEnv }) => {
    const card = getCard(page);
    await card.click();
    const dateButton = page.getByRole('button', { name: new RegExp(e2eEnv.testDateLabel) });
    await dateButton.click();
    await expect(page.getByRole('heading', { name: /Слоты на \d+/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^13:00/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^17:00/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^19:00/ })).toBeVisible();
  });

  test('clicking a slot opens booking dialog', async ({ page, e2eEnv }) => {
    const card = getCard(page);
    await card.click();
    await page.getByRole('button', { name: new RegExp(e2eEnv.testDateLabel) }).click();
    await expect(page.getByRole('button', { name: /^13:00/ })).toBeVisible();
    await page.getByRole('button', { name: /^13:00/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Подтвердите запись' })).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Консультация по проекту')).toBeVisible();
    await expect(page.getByLabel(/Ваше имя/)).toBeVisible();
    await expect(page.getByLabel(/Email/)).toBeVisible();
  });

  test('form validation shows errors for empty fields', async ({ page, e2eEnv }) => {
    const card = getCard(page);
    await card.click();
    await page.getByRole('button', { name: new RegExp(e2eEnv.testDateLabel) }).click();
    await page.getByRole('button', { name: /^13:00/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();
    await expect(page.getByText('Введите имя')).toBeVisible();
  });

  test('form validation shows error for invalid email', async ({ page, e2eEnv }) => {
    const card = getCard(page);
    await card.click();
    await page.getByRole('button', { name: new RegExp(e2eEnv.testDateLabel) }).click();
    await page.getByRole('button', { name: /^13:00/ }).click();
    await page.getByLabel(/Ваше имя/).fill('Иван Петров');
    await page.getByLabel(/Email/).fill('invalid-email');
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();
    await expect(page.getByText('Введите корректный email')).toBeVisible();
  });

  test('successful booking shows toast and closes dialog', async ({ page, e2eEnv }) => {
    const card = getCard(page);
    await card.click();
    await page.getByRole('button', { name: new RegExp(e2eEnv.testDateLabel) }).click();
    await page.getByRole('button', { name: /^13:00/ }).click();
    await page.getByLabel(/Ваше имя/).fill('Иван Петров');
    await page.getByLabel(/Email/).fill('ivan@example.com');
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();
    await expect(page.getByText('Бронирование успешно создано!')).toBeVisible();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('409 conflict shows error toast and keeps dialog open', async ({ page, e2eEnv }) => {
    // Use 17:00 slot (14:00 UTC) to avoid conflict with previous tests that booked 13:00
    const slotUtc = `${e2eEnv.testDateIso}T14:00:00Z`;

    const card = getCard(page);
    await card.click();
    await page.getByRole('button', { name: new RegExp(e2eEnv.testDateLabel) }).click();
    await expect(page.getByRole('heading', { name: /Слоты на \d+/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^17:00/ })).toBeVisible();
    await page.getByRole('button', { name: /^17:00/ }).click();

    // Dialog is open. Now pre-book the SAME slot via API (race condition simulation)
    const res = await fetch('http://localhost:4010/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventTypeId: e2eEnv.eventTypeId,
        slotStart: slotUtc,
        guestName: 'Другой Гость',
        guestEmail: 'other@example.com',
      }),
    });
    expect(res.status).toBe(201);

    await page.getByLabel(/Ваше имя/).fill('Иван Петров');
    await page.getByLabel(/Email/).fill('ivan@example.com');
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();

    await expect(page.getByText('Это время уже занято')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
