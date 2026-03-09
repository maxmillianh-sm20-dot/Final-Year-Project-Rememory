import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { authRouter } from './routes/authRoutes';
import { personaRouter } from './routes/personaRoutes';
import { chatRouter } from './routes/chatRoutes';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/authMiddleware';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(',') ?? ['http://localhost:5173'],
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp());

app.use('/api/auth', authRouter);
app.use('/api/persona', authenticate, personaRouter);
app.use('/api/persona', authenticate, chatRouter);

app.get('/', (req, res) => {
  res.send('Rememory Backend API is running');
});

app.use(errorHandler);

export default app;

