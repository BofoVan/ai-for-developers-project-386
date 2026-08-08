import { useState } from 'react';
import { toast } from 'sonner';
import {
  useAdminEventTypes,
  useCreateEventType,
  useDeleteEventType,
  useAdminBookings,
  useDeleteBooking,
} from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, Trash2, Loader2, Clock } from 'lucide-react';

export function AdminPage() {
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    durationMinutes: 30,
  });

  const { data: eventTypes, isLoading: loadingTypes } = useAdminEventTypes();
  const { data: bookings, isLoading: loadingBookings } = useAdminBookings();
  const createEvent = useCreateEventType();
  const deleteEventType = useDeleteEventType();
  const deleteBooking = useDeleteBooking();

  const handleCreate = () => {
    if (!newEvent.name.trim() || !newEvent.description.trim()) return;
    createEvent.mutate(newEvent, {
      onSuccess: () => {
        toast.success('Тип встречи создан');
        setNewEvent({ name: '', description: '', durationMinutes: 30 });
      },
      onError: () => toast.error('Ошибка при создании типа встречи'),
    });
  };

  const handleDeleteEvent = (id: string) => {
    deleteEventType.mutate(id, {
      onSuccess: () => toast.success('Тип встречи удалён'),
      onError: () => toast.error('Ошибка при удалении типа встречи'),
    });
  };

  const handleDeleteBooking = (id: string) => {
    deleteBooking.mutate(id, {
      onSuccess: () => toast.success('Бронирование удалено'),
      onError: () => toast.error('Ошибка при удалении бронирования'),
    });
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">
          Панель администратора
        </h1>
      </div>

      {/* --- Типы встреч --- */}
      <Card>
        <CardHeader>
          <CardTitle>Типы встреч</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Форма создания */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="evt-name">Название</Label>
              <Input
                id="evt-name"
                value={newEvent.name}
                onChange={(e) =>
                  setNewEvent((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Например, Созвон по проекту"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evt-desc">Описание</Label>
              <Textarea
                id="evt-desc"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent((s) => ({ ...s, description: e.target.value }))
                }
                placeholder="Краткое описание для гостей"
                rows={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evt-dur">Длительность (мин)</Label>
              <div className="flex gap-2">
                <Input
                  id="evt-dur"
                  type="number"
                  min={1}
                  value={newEvent.durationMinutes}
                  onChange={(e) =>
                    setNewEvent((s) => ({
                      ...s,
                      durationMinutes: Number(e.target.value),
                    }))
                  }
                  className="w-24"
                />
                <Button
                  onClick={handleCreate}
                  disabled={
                    !newEvent.name.trim() ||
                    !newEvent.description.trim() ||
                    createEvent.isPending
                  }
                >
                  {createEvent.isPending ? (
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 w-4 h-4" />
                  )}
                  Добавить
                </Button>
              </div>
            </div>
          </div>

          {/* Таблица типов */}
          {loadingTypes ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : eventTypes && eventTypes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Длительность</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventTypes.map((et) => (
                  <TableRow key={et.id}>
                    <TableCell className="font-medium">{et.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate">
                      {et.description}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        {et.durationMinutes} мин
                      </span>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Удалить тип встречи?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Это действие нельзя отменить. Тип встречи{' '}
                              <strong>{et.name}</strong> будет удалён.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEvent(et.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteEventType.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Удалить'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              Пока нет типов встреч. Добавьте первый выше.
            </p>
          )}
        </CardContent>
      </Card>

      {/* --- Бронирования --- */}
      <Card>
        <CardHeader>
          <CardTitle>Бронирования</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBookings ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : bookings && bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тип события</TableHead>
                  <TableHead>Время начала</TableHead>
                  <TableHead>Гость</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">
                      {b.eventTypeId.slice(0, 8)}…
                    </TableCell>
                    <TableCell>
                      {new Date(b.slotStart).toLocaleString('ru-RU')}
                    </TableCell>
                    <TableCell>{b.guestName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.guestEmail}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Удалить бронирование?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Это действие нельзя отменить. Бронирование гостя{' '}
                              <strong>{b.guestName}</strong> на{' '}
                              {new Date(b.slotStart).toLocaleString('ru-RU')}{' '}
                              будет удалено.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBooking(b.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteBooking.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Удалить'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              Пока нет бронирований.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
