import express from 'express';
import cors from 'cors';
import { initSchema, seedIfEmpty, dbPath } from './db.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ingredientsRouter from './routes/ingredients.js';
import customersRouter from './routes/customers.js';
import salesRouter from './routes/sales.js';

const app = express();

app.use(cors());
app.use(express.json());

// Estado de la API (util para la demostracion)
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mensaje: 'API Embriagados funcionando' });
});

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/sales', salesRouter);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

// Las tablas se crean al arrancar y se llenan con datos de ejemplo si estan vacias
initSchema();
seedIfEmpty();

export { dbPath };
export default app;