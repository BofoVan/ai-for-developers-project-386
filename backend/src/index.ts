import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/admin.js';
import guestRoutes from './routes/guest.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// TODO: данные хранятся в памяти и сбрасываются при перезапуске контейнера
// Для продакшена рассмотреть подключение базы данных
app.use(cors({ origin: true }));
app.use(express.json());

// API routes
app.use('/admin', adminRoutes);
app.use('/api', guestRoutes);

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../public')));

// HashRouter fallback: return index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4010;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
