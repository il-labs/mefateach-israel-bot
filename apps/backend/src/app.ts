import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'express-pino-logger';
import { logger } from '@mifal-israel/utils';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pino({ logger: logger as any }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default app;
