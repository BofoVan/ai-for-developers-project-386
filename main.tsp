import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{
  title: "Календарь звонков (учебное приложение)"
})
@info(#{
  version: "1.0.0"
})
@doc("API календаря с разделением на владельца и гостя. Авторизация не требуется.")
@useAuth(NoAuth)
namespace CalendarApp;

// -----------------------------------------------------------------
// Модели данных
// -----------------------------------------------------------------

model EventType {
  @key
  @format("uuid")
  @doc("Уникальный идентификатор типа события")
  id: string;

  @doc("Название типа события (например, 'Созвон по проекту')")
  name: string;

  @doc("Краткое описание для гостей")
  description: string;

  @doc("Длительность встречи в минутах")
  @minValue(1)
  durationMinutes: int32;
}

model EventTypeCreate {
  @doc("Название типа события")
  name: string;

  @doc("Описание")
  description: string;

  @doc("Длительность в минутах")
  @minValue(1)
  durationMinutes: int32;
}

model Booking {
  @key
  @format("uuid")
  @doc("Уникальный идентификатор бронирования")
  id: string;

  @doc("Ссылка на тип события")
  eventTypeId: string;

  @doc("Дата и время начала (UTC)")
  slotStart: utcDateTime;

  @doc("Имя гостя")
  guestName: string;

  @doc("Email гостя для связи")
  guestEmail: string;
}

model BookingRequest {
  @doc("ID типа события, которое бронируют")
  eventTypeId: string;

  @doc("Желаемое время начала (UTC)")
  slotStart: utcDateTime;

  @doc("Имя гостя")
  @minLength(1)
  guestName: string;

  @doc("Email гостя")
  @format("email")
  guestEmail: string;
}

model Slot {
  @doc("Начало свободного интервала (UTC)")
  start: utcDateTime;

  @doc("Окончание свободного интервала (UTC)")
  end: utcDateTime;
}

// Ошибка при попытке занять уже занятое время
@error
model ConflictError {
  @statusCode _: 409;
  code: "SLOT_ALREADY_TAKEN";
  message: string;
}

// Ошибка, если бронирование не найдено (удаление и др.)
@error
model NotFoundError {
  @statusCode _: 404;
  code: "BOOKING_NOT_FOUND";
  message: string;
}

// Ошибка сервера
@error
model InternalServerError {
  @statusCode _: 500;
  code: "INTERNAL_SERVER_ERROR";
  message: string;
}

// -----------------------------------------------------------------
// Эндпоинты для владельца календаря (admin)
// -----------------------------------------------------------------

@route("/admin")
@tag("Admin")
@doc("Функции владельца календаря")
interface AdminOperations {
  @summary("Создать тип события")
  @doc("Создать новый тип события")
  @route("/event-types")
  @post
  createEventType(@body event: EventTypeCreate): CreatedResponse & Body<EventType> | InternalServerError;

  @summary("Получить все типы событий")
  @doc("Получить все типы событий")
  @route("/event-types")
  @get
  listEventTypes(): EventType[] | InternalServerError;

  @summary("Удалить тип события")
  @doc("Удалить тип события по идентификатору")
  @route("/event-types/{eventTypeId}")
  @delete
  deleteEventType(
    @path
    @doc("ID типа события, которое требуется удалить")
    @format("uuid")
    eventTypeId: string
  ): NoContentResponse | NotFoundError | InternalServerError;

  @summary("Получить бронирования")
  @doc("Получить список всех предстоящих бронирований (любых типов)")
  @route("/bookings")
  @get
  listBookings(
    @doc("Начало периода (UTC)") @query from?: utcDateTime,
    @doc("Конец периода (UTC)") @query to?: utcDateTime
  ): Booking[] | InternalServerError;

  @summary("Удалить бронирование")
  @doc("Удалить бронирование по идентификатору")
  @route("/bookings/{bookingId}")
  @delete
  deleteBooking(
    @path
    @doc("ID бронирования, которое требуется удалить")
    @format("uuid")
    bookingId: string
  ): NoContentResponse | NotFoundError | InternalServerError;
}

// -----------------------------------------------------------------
// Эндпоинты для гостей (публичные)
// -----------------------------------------------------------------

@route("/api")
@tag("Guest")
@doc("Публичные функции для гостей")
interface GuestOperations {
  @summary("Получить типы событий")
  @doc("Получить список доступных для бронирования типов событий")
  @route("/event-types")
  @get
  getPublicEventTypes(): EventType[] | InternalServerError;

  @summary("Получить свободные слоты")
  @doc("Получить свободные слоты для конкретного типа события")
  @route("/event-types/{eventTypeId}/slots")
  @get
  getAvailableSlots(
    @path
    @doc("ID типа события")
    @format("uuid")
    eventTypeId: string,

    @doc("Начало окна поиска (UTC), по умолчанию – текущее время")
    @query from?: utcDateTime,

    @doc("Конец окна поиска (UTC), по умолчанию – +14 дней от from")
    @query to?: utcDateTime
  ): Slot[] | NotFoundError | InternalServerError;

  @summary("Создать бронирование")
  @doc("Создать новое бронирование")
  @route("/bookings")
  @post
  createBooking(@body booking: BookingRequest): CreatedResponse & Body<Booking> | ConflictError | InternalServerError;
}
