import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Shield } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
            <CalendarDays className="w-6 h-6" />
            <span>Календарь звонков</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/book"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/book' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Записаться
            </Link>
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Shield className="w-4 h-4" />
              Админ
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>Учебное приложение — Календарь звонков</p>
      </footer>
    </div>
  );
}
