import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/database.js';
import { authRouter } from './routes/auth.js';
import { chaptersRouter } from './routes/chapters.js';
import { userRouter } from './routes/user.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/', (req, res) => {
  res.json({
    message: 'EconoLearn API',
    version: '1.0.0',
    docs: '/docs'
  });
});

app.use('/api/auth', authRouter);
app.use('/api/chapters', chaptersRouter);
app.use('/api/user', userRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: '服务器错误' });
});

initDatabase();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
