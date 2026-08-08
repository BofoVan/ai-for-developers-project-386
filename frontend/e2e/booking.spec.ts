import { test, expect } from '@playwright/test';

test.describe('BookingPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/book');
  });

  test('renders 3-column layout with calendar always visible', async ({ page }) => {
    // Page header
    await expect(page.getByRole('heading', { name: 'Запись на встречу' })).toBeVisible();

    // Left column: event types
    await expect(page.getByRole('heading', { name: 'Тип встречи' })).toBeVisible();
    await expect(page.getByText('Консультация по проекту')).toBeVisible();

    // Center column: calendar always visible
    await expect(page.getByRole('heading', { name: 'Календарь' })).toBeVisible();
    await expect(page.getByRole('grid', { name: /August \d{4}/ })).toBeVisible();

    // Right column: slots section
    await expect(page.getByRole('heading', { name: /Доступные слоты/ })).toBeVisible();
    await expect(page.getByText('Выберите тип встречи слева', { exact: true })).toBeVisible();
  });

  test('selecting event type highlights the card', async ({ page }) => {
    // Find the card using a CSS selector based on the text content
    const card = page.locator('div').filter({ has: page.getByText('Консультация по проекту', { exact: true }) }).locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');

    // Click to select
    await card.click();

    // Now highlighted (border-primary class on the Card)
    await expect(card).toHaveClass(/border-primary/);

    // Right column shows hint to select date
    await expect(page.getByText('Выберите дату в календаре')).toBeVisible();
  });

  test('past dates are disabled in calendar', async ({ page }) => {
    // Select event type first
    const card = page.locator('div').filter({ has: page.getByText('Консультация по проекту', { exact: true }) }).locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');
    await card.click();

    // Try clicking a past date (July 31st should be disabled)
    const pastDate = page.getByRole('button', { name: /July 31st/ });
    await expect(pastDate).toBeDisabled();
  });

  test('selecting date loads available slots', async ({ page }) => {
    // Select event type
    const card = page.locator('div').filter({ has: page.getByText('Консультация по проекту', { exact: true }) }).locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');
    await card.click();

    // Select tomorrow's date (9th August 2026)
    const dateButton = page.getByRole('button', { name: /August 9th/ });
    await dateButton.click();

    // Wait for slots to appear
    await expect(page.getByRole('heading', { name: /Слоты на 9 August/ })).toBeVisible();

    // Slots should be visible (Prism returns example: 13:00, 17:00, 19:00)
    await expect(page.getByRole('button', { name: '13:00' })).toBeVisible();
    await expect(page.getByRole('button', { name: '17:00' })).toBeVisible();
    await expect(page.getByRole('button', { name: '19:00' })).toBeVisible();
  });

  test('clicking a slot opens booking dialog', async ({ page }) => {
    // Select event type and date
    const card = page.locator('div').filter({ has: page.getByText('Консультация по проекту', { exact: true }) }).locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');
    await card.click();
    await page.getByRole('button', { name: /August 9th/ }).click();

    // Wait for slots
    await expect(page.getByRole('button', { name: '13:00' })).toBeVisible();

    // Click a slot
    await page.getByRole('button', { name: '13:00' }).click();

    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Подтвердите запись' })).toBeVisible();

    // The event type name should be in the dialog description
    await expect(page.getByRole('dialog').getByText('Консультация по проекту')).toBeVisible();

    await expect(page.getByLabel(/Ваше имя/)).toBeVisible();
    await expect(page.getByLabel(/Email/)).toBeVisible();
  });

  test('form validation shows errors for empty fields', async ({ page }) => {
    // Select event type, date, and slot
    const card = page.locator('div').filter({ has: page.getByText('Консультация по проекту', { exact: true }) }).locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');
    await card.click();
    await page.getByRole('button', { name: /August 9th/ }).click();
    await page.getByRole('button', { name: '13:00' }).click();

    // Dialog is open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click submit without filling fields
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();

    // Toast error should appear
    await expect(page.getByText('Введите имя')).toBeVisible();
  });

  test('form validation shows error for invalid email', async ({ page }) => {
    // Select event type, date, and slot
    const card = page.locator('div').filter({ has: page.getByText('Консультация по проекту', { exact: true }) }).locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');
    await card.click();
    await page.getByRole('button', { name: /August 9th/ }).click();
    await page.getByRole('button', { name: '13:00' }).click();

    // Fill name but invalid email
    await page.getByLabel(/Ваше имя/).fill('Иван Петров');
    await page.getByLabel(/Email/).fill('invalid-email');

    // Submit
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();

    // Toast error
    await expect(page.getByText('Введите корректный email')).toBeVisible();
  });

  test('successful booking shows toast and closes dialog', async ({ page }) => {
    // Mock the booking creation to return 201
    await page.route('**/api/bookings', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'bk-test-001',
          eventTypeId: '550e8400-e29b-41d4-a716-446655440000',
          slotStart: '2026-08-09T13:00:00Z',
          guestName: 'Иван Петров',
          guestEmail: 'ivan@example.com',
        }),
      });
    });

    // Select event type, date, and slot
    const card = page.locator('div').filter({ has: page.getByText('Консультация по проекту', { exact: true }) }).locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');
    await card.click();
    await page.getByRole('button', { name: /August 9th/ }).click();
    await page.getByRole('button', { name: '13:00' }).click();

    // Fill form
    await page.getByLabel(/Ваше имя/).fill('Иван Петров');
    await page.getByLabel(/Email/).fill('ivan@example.com');

    // Submit
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();

    // Success toast
    await expect(page.getByText('Бронирование успешно создано!')).toBeVisible();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('409 conflict shows error toast and keeps dialog open', async ({ page }) => {
    // Mock the booking creation to return 409
    await page.route('**/api/bookings', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'SLOT_ALREADY_TAKEN',
          message: 'This time slot is already booked',
        }),
      });
    });

    // Select event type, date, and slot
    const card = page.locator('div').filter({ has: page.getByText('Консультация по проекту', { exact: true }) }).locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');
    await card.click();
    await page.getByRole('button', { name: /August 9th/ }).click();
    await page.getByRole('button', { name: '13:00' }).click();

    // Fill form
    await page.getByLabel(/Ваше имя/).fill('Иван Петров');
    await page.getByLabel(/Email/).fill('ivan@example.com');

    // Submit
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();

    // Error toast
    await expect(page.getByText('Это время уже занято')).toBeVisible();

    // Dialog should still be open
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
