import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/admin.js';
import guestRoutes from './routes/guest.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/admin', adminRoutes);
app.use('/api', guestRoutes);

app.use(errorHandler);

const PORT = 4010;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
