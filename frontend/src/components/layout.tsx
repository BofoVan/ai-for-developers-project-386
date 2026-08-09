import { Link, useLocation } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col text-foreground relative">
      {/* Persistent background — never unmounts between page changes */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: 'url(/background_1.jpg)' }}
      />
      <div className="fixed inset-0 bg-black/30 -z-10" />

      <header className="border-b border-border bg-white shadow-sm relative z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-yellow-500 shadow-sm">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <span>Календарь звонков</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/book"
              className={`text-sm font-medium transition-colors hover:text-primary pb-1 border-b-2 ${
                location.pathname === '/book'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent'
              }`}
            >
              Записаться
            </Link>
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary pb-1 border-b-2 ${
                location.pathname === '/admin'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent'
              }`}
            >
              Админ
            </Link>
          </nav>
        </div>
      </header>

      <main className={`flex-1 relative z-10 ${location.pathname === '/' ? 'flex flex-col overflow-hidden' : location.pathname === '/book' ? 'flex flex-col overflow-hidden' : 'container mx-auto px-4 py-8'}`}>
        {children}
      </main>

    </div>
  );
}
