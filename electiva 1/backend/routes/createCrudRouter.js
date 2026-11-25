import { Router } from 'express';

/**
 * Construye un router REST delgado. Toda la logica vive en el servicio;
 * aqui solo se traduce HTTP <-> servicio.
 */
export default function createCrudRouter(service, { search = false, sort = false } = {}) {
  const router = Router();

  router.get('/', (req, res, next) => {
    try {
      const options = {};
      if (search) options.search = req.query.search;
      if (sort) options.order = req.query.order;
      res.json(service.list(Object.keys(options).length ? options : undefined));
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', (req, res, next) => {
    try {
      res.json(service.get(req.params.id));
    } catch (error) {
      next(error);
    }
  });

  router.post('/', (req, res, next) => {
    try {
      res.status(201).json(service.create(req.body ?? {}));
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', (req, res, next) => {
    try {
      res.json(service.update(req.params.id, req.body ?? {}));
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', (req, res, next) => {
    try {
      res.json(service.remove(req.params.id));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
