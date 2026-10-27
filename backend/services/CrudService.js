import { NotFoundError } from '../errors/AppError.js';

/**
 * Servicio CRUD base. Concentra la logica comun y delega el acceso a datos
 * al repositorio inyectado en el constructor.
 */
export default class CrudService {
  constructor(repository, { notFoundMessage = 'Registro no encontrado' } = {}) {
    this.repository = repository;
    this.notFoundMessage = notFoundMessage;
  }

  list(options) {
    return this.repository.findAll(options);
  }

  get(id) {
    const row = this.repository.findById(id);
    if (!row) throw new NotFoundError(this.notFoundMessage);
    return row;
  }

  create(data) {
    return this.repository.create(this.validateCreate(data ?? {}));
  }

  update(id, data) {
    this.get(id);
    const updated = this.repository.update(id, this.validateUpdate(data ?? {}));
    if (!updated) throw new NotFoundError(this.notFoundMessage);
    return updated;
  }

  remove(id) {
    this.get(id);
    this.repository.delete(id);
    return { deleted: true, id: Number(id) };
  }

  validateCreate(data) {
    return data;
  }

  validateUpdate(data) {
    return data;
  }
}
