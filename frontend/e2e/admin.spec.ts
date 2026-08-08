import { test, expect } from '@playwright/test';

test.describe('AdminPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/admin');
  });

  test('renders event types and bookings tables', async ({ page }) => {
    // Page header
    await expect(page.getByRole('heading', { name: 'Панель администратора' })).toBeVisible();

    // Event types section
    await expect(page.getByText('Типы встреч', { exact: true })).toBeVisible();
    await expect(page.getByText('Консультация по проекту')).toBeVisible();
    await expect(page.getByText('30 мин')).toBeVisible();

    // Bookings section
    await expect(page.getByText('Бронирования', { exact: true })).toBeVisible();
    await expect(page.getByText('Иван Петров')).toBeVisible();
    await expect(page.getByText('Мария Сидорова')).toBeVisible();
    await expect(page.getByText('ivan@example.com')).toBeVisible();
  });

  test('creates a new event type', async ({ page }) => {
    // Mock the POST response to return the created type
    await page.route('**/admin/event-types', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new-event-type-001',
          name: 'Тестовая встреча',
          description: 'Описание тестовой встречи',
          durationMinutes: 45,
        }),
      });
    });

    // Also mock the GET list to include the new type
    await page.route('**/admin/event-types', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              name: 'Консультация по проекту',
              description: 'Индивидуальная консультация для обсуждения деталей проекта',
              durationMinutes: 30,
            },
            {
              id: 'new-event-type-001',
              name: 'Тестовая встреча',
              description: 'Описание тестовой встречи',
              durationMinutes: 45,
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    // Fill the form
    await page.getByPlaceholder('Например, Созвон по проекту').fill('Тестовая встреча');
    await page.getByPlaceholder('Краткое описание для гостей').fill('Описание тестовой встречи');

    // Find the duration input
    const durationInput = page.locator('input[type="number"]').first();
    await durationInput.fill('45');

    // Click add button
    await page.getByRole('button', { name: 'Добавить' }).click();

    // New type should appear in table
    await expect(page.getByText('Тестовая встреча')).toBeVisible();
    await expect(page.getByText('45 мин')).toBeVisible();
  });

  test('deletes an event type with confirmation', async ({ page }) => {
    // Wait for the table to load
    await expect(page.getByText('Консультация по проекту')).toBeVisible();

    // Find the delete button in the event types table (trash icon button)
    // Get the table row containing the event type name
    const table = page.locator('table').first();
    const eventTypeRow = table.locator('tr').filter({ has: page.getByText('Консультация по проекту') });
    const deleteButton = eventTypeRow.locator('button').last();

    // Click delete
    await deleteButton.click();

    // AlertDialog should appear
    await expect(page.getByText('Удалить тип встречи?')).toBeVisible();

    // The event type name should be in the dialog description (not the table)
    await expect(page.getByRole('alertdialog').getByText('Консультация по проекту')).toBeVisible();

    // Confirm deletion — scope to the alert dialog
    const alertDialog = page.getByRole('alertdialog');
    await alertDialog.getByRole('button', { name: 'Удалить' }).click();

    // Verify the delete was triggered (toast appears)
    await expect(page.getByText('Тип встречи удалён')).toBeVisible();
  });

  test('deletes a booking with confirmation', async ({ page }) => {
    // Mock the bookings list to have a deletable item
    await page.route('**/admin/bookings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'bk-delete-test',
            eventTypeId: '550e8400-e29b-41d4-a716-446655440000',
            slotStart: '2026-08-09T13:00:00Z',
            guestName: 'Тестовый Гость',
            guestEmail: 'test@example.com',
          },
        ]),
      });
    });

    // Refresh to load mocked data
    await page.reload();

    // Wait for the mocked booking to appear
    await expect(page.getByText('Тестовый Гость')).toBeVisible();

    // Find and click delete button for the booking
    const table = page.locator('table').last();
    const bookingRow = table.locator('tr').filter({ has: page.getByText('Тестовый Гость') });
    const deleteButton = bookingRow.locator('button').last();
    await deleteButton.click();

    // AlertDialog should appear
    await expect(page.getByText('Удалить бронирование?')).toBeVisible();

    // The guest name should be in the dialog
    await expect(page.getByRole('alertdialog').getByText('Тестовый Гость')).toBeVisible();

    // Confirm deletion — scope to the alert dialog
    const alertDialog = page.getByRole('alertdialog');
    await alertDialog.getByRole('button', { name: 'Удалить' }).click();

    // Verify the delete was triggered (toast appears)
    await expect(page.getByText('Бронирование удалено')).toBeVisible();
  });
});
