import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/api/client';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  ArrowRight,
  Shield,
  Clock,
  MailCheck,
  CalendarCheck,
  Loader2,
} from 'lucide-react';

export function LandingPage() {
  const { data: eventTypes, isLoading } = useQuery({
    queryKey: ['event-types'],
    queryFn: async () => {
      const { data } = await client.GET('/api/event-types');
      return data ?? [];
    },
  });

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10">
          <CalendarDays className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl max-w-2xl">
          Календарь звонков
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl">
          Быстрая и удобная запись на консультации, созвоны и встречи.
          Выберите удобное время — мы всё организуем.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link to="/#/book" className={buttonVariants({ size: 'lg' })}>
            Записаться
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>

          <Link
            to="/#/admin"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            <Shield className="mr-2 w-4 h-4" />
            Войти как администратор
          </Link>
        </div>
      </section>

      {/* Преимущества */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
        <Card>
          <CardHeader className="pb-3">
            <Clock className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-base">1. Выберите время</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Просмотрите доступные слоты в календаре и выберите подходящее
              для встречи время.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <MailCheck className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-base">2. Заполните данные</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Укажите имя и email — мы пришлём напоминание о предстоящей
              встрече.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CalendarCheck className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-base">3. Готово!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Встреча добавлена в календарь. Ждём вас в назначенное время.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Доступные встречи (из API) */}
      <section className="max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">
          Доступные типы встреч
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : eventTypes && eventTypes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventTypes.map((et) => (
              <Card key={et.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{et.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground flex-1">
                    {et.description}
                  </p>
                  <Badge variant="secondary" className="w-fit">
                    <Clock className="mr-1 w-3 h-3" />
                    {et.durationMinutes} мин
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Пока нет доступных типов встреч</p>
            <p className="text-sm mt-1">
              Администратор может добавить их в панели управления
            </p>
          </div>
        )}
      </section>

    </div>
  );
}
