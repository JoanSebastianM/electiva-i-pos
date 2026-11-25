import { Router } from 'express';
import { recipeService } from '../container.js';

const router = Router({ mergeParams: true });

router.get('/', (req, res, next) => {
  try {
    res.json(recipeService.list(req.params.productId));
  } catch (error) {
    next(error);
  }
});

router.put('/', (req, res, next) => {
  try {
    res.json(recipeService.replace(req.params.productId, req.body ?? {}));
  } catch (error) {
    next(error);
  }
});

export default router;
