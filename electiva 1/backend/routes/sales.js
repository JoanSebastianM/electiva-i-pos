import { Router } from 'express';
import { saleService } from '../container.js';

const router = Router();

router.get('/', (req, res, next) => {
  try {
    res.json(saleService.list());
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    res.json(saleService.get(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    res.status(201).json(saleService.registerSale({ ...(req.body || {}), userId: req.user?.id ?? null }));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    res.json(saleService.remove(req.params.id));
  } catch (error) {
    next(error);
  }
});

export default router;
