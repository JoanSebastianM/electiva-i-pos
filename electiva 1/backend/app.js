import express from 'express';
import cors from 'cors';
import { initSchema, seedIfEmpty, dbPath } from './db.js';
import { AppError } from './errors/AppError.js';
import { adminExceptRead, authenticate, authorize, requirePosClient, salesPolicy } from './middleware/auth.js';
import productsRouter from './routes/products.js';
import recipesRouter from './routes/recipes.js';
import categoriesRouter from './routes/categories.js';
import ingredientsRouter from './routes/ingredients.js';
import customersRouter from './routes/customers.js';
import salesRouter from './routes/sales.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import inventoryRouter from './routes/inventory.js';

const app = express();
const allowedOrigins = String(
  process.env.CORS_ORIGINS || 'http://localhost:5500,http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-POS-Client']
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mensaje: 'API POS Granizados funcionando' });
});

app.use('/api', requirePosClient);
app.use('/api/auth', authRouter);

app.use('/api', authenticate);
app.use('/api/users', authorize('admin'), usersRouter);
app.use('/api/inventory', adminExceptRead, inventoryRouter);
app.use('/api/products/:productId/recipes', adminExceptRead, recipesRouter);
app.use('/api/products', adminExceptRead, productsRouter);
app.use('/api/categories', adminExceptRead, categoriesRouter);
app.use('/api/ingredients', adminExceptRead, ingredientsRouter);
app.use('/api/customers', adminExceptRead, customersRouter);
app.use('/api/sales', salesPolicy, salesRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

initSchema();
seedIfEmpty();

export { dbPath };
export default app;
