import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = config.clientUrl.split(',').map(url => url.trim());
      // Allow requests with no origin (like mobile apps or curl requests)
      // or if the origin is in our allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', routes);

if (config.isProduction) {
  const frontendPath = path.join(process.cwd(), '../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
