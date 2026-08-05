import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { LandingPage } from '@/pages/LandingPage';
import { AdminPage } from '@/pages/AdminPage';
import { BookingPage } from '@/pages/BookingPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/book" element={<BookingPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
