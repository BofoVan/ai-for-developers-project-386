import { useState } from 'react';
import { usePublicEventTypes, useAvailableSlots, useCreateBooking } from '@/api/guest';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Clock, Loader2, User, Mail, CalendarDays, ArrowRight } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import type { components } from '@/api/generated/types';

type EventType = components['schemas']['EventType'];
type Slot = components['schemas']['Slot'];

export function BookingPage() {
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const { data: eventTypes, isLoading: typesLoading } = usePublicEventTypes();

  const from = selectedDate ? startOfDay(selectedDate).toISOString() : undefined;
  const to = selectedDate ? endOfDay(selectedDate).toISOString() : undefined;

  const {
    data: slots,
    isLoading: slotsLoading,
    error: slotsError,
  } = useAvailableSlots(selectedEventType?.id, from, to);

  const createBooking = useCreateBooking();

  function handleSelectEventType(et: EventType) {
    setSelectedEventType(et);
    setSelectedDate(undefined);
    setSelectedSlot(null);
  }

  function handleSelectDate(date: Date | undefined) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function handleSelectSlot(slot: Slot) {
    setSelectedSlot(slot);
    setGuestName('');
    setGuestEmail('');
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!selectedEventType || !selectedSlot) return;

    if (!guestName.trim()) {
      toast.error('Введите имя');
      return;
    }
    if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      toast.error('Введите корректный email');
      return;
    }

    try {
      await createBooking.mutateAsync({
        eventTypeId: selectedEventType.id,
        slotStart: selectedSlot.start,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
      });
      toast.success('Бронирование успешно создано!');
      setDialogOpen(false);
      setGuestName('');
      setGuestEmail('');
      setSelectedSlot(null);
    } catch (err: unknown) {
      let message = 'Произошла ошибка при создании бронирования';
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 'SLOT_ALREADY_TAKEN'
      ) {
        message = 'Это время уже занято. Выберите другой слот.';
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Запись на встречу</h1>
        <p className="text-muted-foreground mt-2">
          Выберите тип встречи, дату и удобное время
        </p>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Event Types */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            Тип встречи
          </h2>

          {typesLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : eventTypes && eventTypes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {eventTypes.map((et) => (
                <Card
                  key={et.id}
                  className={`cursor-pointer transition-all ${
                    selectedEventType?.id === et.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'hover:border-primary/30 hover:shadow-sm'
                  }`}
                  onClick={() => handleSelectEventType(et)}
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{et.name}</h3>
                      {selectedEventType?.id === et.id && (
                        <ArrowRight className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {et.description}
                    </p>
                    <Badge variant="secondary" className="w-fit text-xs">
                      <Clock className="mr-1 w-3 h-3" />
                      {et.durationMinutes} мин
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm py-4">
              Пока нет доступных типов встреч
            </div>
          )}
        </div>

        {/* Center Column: Calendar (always visible) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            Календарь
          </h2>

          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelectDate}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-md border shadow-sm w-full"
            />
          </div>

          {!selectedEventType && (
            <p className="text-xs text-muted-foreground text-center">
              Выберите тип встречи слева, чтобы увидеть слоты
            </p>
          )}
        </div>

        {/* Right Column: Slots */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {selectedDate
              ? `Слоты на ${format(selectedDate, 'd MMMM')}`
              : 'Доступные слоты'}
          </h2>

          {!selectedEventType ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <CalendarDays className="w-10 h-10 opacity-30" />
              <p className="text-sm text-center">
                Выберите тип встречи слева
              </p>
            </div>
          ) : !selectedDate ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <CalendarDays className="w-10 h-10 opacity-30" />
              <p className="text-sm text-center">
                Выберите дату в календаре
              </p>
            </div>
          ) : slotsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : slotsError ? (
            <p className="text-sm text-destructive py-4">
              Ошибка загрузки слотов
            </p>
          ) : slots && slots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot, idx) => (
                <Button
                  key={idx}
                  variant={selectedSlot?.start === slot.start ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleSelectSlot(slot)}
                  className="flex flex-col items-center h-auto py-3"
                >
                  <span className="text-base font-semibold">
                    {format(new Date(slot.start), 'HH:mm')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    до {format(new Date(slot.end), 'HH:mm')}
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <Clock className="w-10 h-10 opacity-30" />
              <p className="text-sm text-center">
                Нет свободных слотов
              </p>
              <p className="text-xs text-center">
                Попробуйте выбрать другую дату
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Подтвердите запись</DialogTitle>
            <DialogDescription>
              {selectedEventType?.name} —{' '}
              {selectedSlot &&
                format(new Date(selectedSlot.start), 'd MMMM yyyy, HH:mm')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dialog-guest-name">
                <User className="inline w-4 h-4 mr-1" />
                Ваше имя
              </Label>
              <Input
                id="dialog-guest-name"
                placeholder="Иван Петров"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dialog-guest-email">
                <Mail className="inline w-4 h-4 mr-1" />
                Email
              </Label>
              <Input
                id="dialog-guest-email"
                type="email"
                placeholder="ivan@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={createBooking.isPending}
              className="w-full sm:w-auto"
            >
              {createBooking.isPending ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : null}
              {createBooking.isPending ? 'Создание...' : 'Подтвердить запись'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
