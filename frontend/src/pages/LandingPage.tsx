import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CalendarDays,
  ArrowRight,
  Clock,
  MailCheck,
  CalendarCheck,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
      <div className="relative z-10 w-full flex flex-col justify-center items-center gap-6 px-4 py-4 overflow-hidden" style={{ marginTop: '-100px' }}>
        {/* Hero */}
        <section className="w-full">
          <div className="mx-auto max-w-4xl flex flex-col items-center text-center gap-4 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-yellow-500 shadow-sm shrink-0">
                <CalendarDays className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Календарь звонков
              </h1>
            </div>

            <p className="text-base text-muted-foreground max-w-lg">
              Быстрая и удобная запись на консультации, созвоны и встречи.
              Выберите удобное время — мы всё организуем.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/book" className={buttonVariants({ size: 'default' })}>
                Записаться
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>

              <Link
                to="/admin"
                className={buttonVariants({ variant: 'outline', size: 'default' })}
              >
                Войти как администратор
              </Link>
            </div>
          </div>
        </section>

        {/* Преимущества */}
        <section className="w-full">
          <div className="mx-auto max-w-4xl bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <Clock className="w-6 h-6 text-primary mb-1" />
                  <CardTitle className="text-sm">1. Выберите время</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Просмотрите доступные слоты в календаре и выберите подходящее
                    для встречи время.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <MailCheck className="w-6 h-6 text-primary mb-1" />
                  <CardTitle className="text-sm">2. Заполните данные</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Укажите имя и email — мы пришлём напоминание о предстоящей
                    встрече.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CalendarCheck className="w-6 h-6 text-primary mb-1" />
                  <CardTitle className="text-sm">3. Готово!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Встреча добавлена в календарь. Ждём вас в назначенное время.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
