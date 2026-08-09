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
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Loader2, Clock } from 'lucide-react';

export function AdminPage() {
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    durationMinutes: 30,
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showCreateValidation, setShowCreateValidation] = useState(false);

  const { data: eventTypes, isLoading: loadingTypes } = useAdminEventTypes();
  const { data: bookings, isLoading: loadingBookings } = useAdminBookings();
  const createEvent = useCreateEventType();
  const deleteEventType = useDeleteEventType();
  const deleteBooking = useDeleteBooking();

  const handleCreate = () => {
    if (!newEvent.name.trim() || !newEvent.description.trim()) {
      setShowCreateValidation(true);
      return;
    }
    setShowCreateValidation(false);
    createEvent.mutate(newEvent, {
      onSuccess: () => {
        toast.success('Тип встречи создан');
        setNewEvent({ name: '', description: '', durationMinutes: 30 });
        setCreateDialogOpen(false);
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
      {/* --- Event types table --- */}
      <Card>
        <CardHeader>
          <CardTitle>Типы встреч</CardTitle>
          <CardAction>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 w-4 h-4" />
              Создать тип встречи
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {loadingTypes ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : eventTypes && eventTypes.length > 0 ? (
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
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
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              Пока нет типов встреч.
            </p>
          )}
        </CardContent>
      </Card>

      {/* --- Create event type dialog --- */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setShowCreateValidation(false);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pb-0">
            <DialogTitle>Создать тип встречи</DialogTitle>
            <DialogDescription>
              Заполните поля ниже, чтобы добавить новый тип встречи
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-evt-name">Название</Label>
              <Input
                id="dialog-evt-name"
                value={newEvent.name}
                onChange={(e) => {
                  setNewEvent((s) => ({ ...s, name: e.target.value }));
                  if (showCreateValidation) setShowCreateValidation(false);
                }}
                placeholder="Например, Созвон по проекту"
                aria-invalid={showCreateValidation && !newEvent.name.trim()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-evt-desc">Описание</Label>
              <Textarea
                id="dialog-evt-desc"
                value={newEvent.description}
                onChange={(e) => {
                  setNewEvent((s) => ({ ...s, description: e.target.value }));
                  if (showCreateValidation) setShowCreateValidation(false);
                }}
                placeholder="Краткое описание для гостей"
                rows={3}
                aria-invalid={showCreateValidation && !newEvent.description.trim()}
              />
            </div>
            <div className="space-y-2">
              <Label>Длительность</Label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 45, 60, 90, 120].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      setNewEvent((s) => ({
                        ...s,
                        durationMinutes: m,
                      }))
                    }
                    className="cursor-pointer w-full"
                  >
                    <Badge
                      variant={
                        newEvent.durationMinutes === m ? 'default' : 'outline'
                      }
                      className="px-5 py-2.5 text-base w-full justify-center"
                    >
                      {m} мин
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleCreate}
              disabled={createEvent.isPending}
            >
              {createEvent.isPending && (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              )}
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Bottom row: bookings --- */}
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
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
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
            </div>
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
