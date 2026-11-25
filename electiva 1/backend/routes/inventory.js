import { Router } from 'express';
import { inventoryService } from '../container.js';

const router = Router();

router.get('/', (_req, res, next) => {
  try {
    res.json(inventoryService.list());
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    res.json(inventoryService.get(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    res.json(inventoryService.adjustStock(req.params.id, req.body ?? {}));
  } catch (error) {
    next(error);
  }
});

export default router;
