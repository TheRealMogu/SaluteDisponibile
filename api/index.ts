import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerRoutes } from '../server/routes';

const app = express();

app.set('trust proxy', 1);

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Troppe richieste da questo IP, riprova tra 15 minuti" },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Troppe registrazioni da questo IP, riprova tra 15 minuti" },
  standardHeaders: true,
  legacyHeaders: false,
});

registerRoutes(app, registrationLimiter);

export default app;
