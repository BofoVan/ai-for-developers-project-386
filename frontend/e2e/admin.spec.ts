import { test, expect } from './setup/fixtures.js';

test.describe('AdminPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/admin');
  });

  test('renders event types and bookings tables', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Панель администратора' })).toBeVisible();
    await expect(page.getByText('Типы встреч', { exact: true })).toBeVisible();
    await expect(page.getByText('Консультация по проекту')).toBeVisible();
    await expect(page.getByText('30 мин')).toBeVisible();
    await expect(page.getByText('Бронирования', { exact: true })).toBeVisible();
    await expect(page.getByText('Иван Петров')).toBeVisible();
    await expect(page.getByText('Мария Сидорова')).toBeVisible();
    await expect(page.getByText('ivan@example.com')).toBeVisible();
  });

  test('creates a new event type', async ({ page }) => {
    await page.getByPlaceholder('Например, Созвон по проекту').fill('Тестовая встреча');
    await page.getByPlaceholder('Краткое описание для гостей').fill('Описание тестовой встречи');
    const durationInput = page.locator('input[type="number"]').first();
    await durationInput.fill('45');
    await page.getByRole('button', { name: 'Добавить' }).click();
    await expect(page.getByText('Тестовая встреча')).toBeVisible();
    await expect(page.getByText('45 мин')).toBeVisible();
  });

  test('deletes an event type with confirmation', async ({ page }) => {
    // Create a disposable event type to avoid affecting seed data
    await page.getByPlaceholder('Например, Созвон по проекту').fill('Временный тип');
    await page.getByPlaceholder('Краткое описание для гостей').fill('Описание временного типа');
    const durationInput = page.locator('input[type="number"]').first();
    await durationInput.fill('20');
    await page.getByRole('button', { name: 'Добавить' }).click();
    await expect(page.getByText('Временный тип')).toBeVisible();

    // Find and delete it
    const table = page.locator('table').first();
    const eventTypeRow = table.locator('tr').filter({ has: page.getByText('Временный тип') });
    const deleteButton = eventTypeRow.locator('button').last();
    await deleteButton.click();

    await expect(page.getByText('Удалить тип встречи?')).toBeVisible();
    await expect(page.getByRole('alertdialog').getByText('Временный тип')).toBeVisible();

    const alertDialog = page.getByRole('alertdialog');
    await alertDialog.getByRole('button', { name: 'Удалить' }).click();

    await expect(page.getByText('Тип встречи удалён')).toBeVisible();
  });

  test('deletes a booking with confirmation', async ({ page }) => {
    await expect(page.getByText('Иван Петров')).toBeVisible();

    const table = page.locator('table').last();
    const bookingRow = table.locator('tr').filter({ has: page.getByText('Иван Петров') });
    const deleteButton = bookingRow.locator('button').last();
    await deleteButton.click();

    await expect(page.getByText('Удалить бронирование?')).toBeVisible();
    await expect(page.getByRole('alertdialog').getByText('Иван Петров')).toBeVisible();

    const alertDialog = page.getByRole('alertdialog');
    await alertDialog.getByRole('button', { name: 'Удалить' }).click();

    await expect(page.getByText('Бронирование удалено')).toBeVisible();
  });
});
