import { NotFoundError, ValidationError } from '../errors/AppError.js';

/**
 * Servicio CRUD reutilizable para la entidad que administra el repositorio recibido.
 * Las clases ProductService, CategoryService, CustomerService e IngredientService
 * exponen nombres específicos y delegan aquí las operaciones que comparten.
 */
export default class CrudService {
  constructor(repository, { notFoundMessage = 'Registro no encontrado' } = {}) {
    if (!repository) {
      throw new Error('CrudService requiere un repositorio');
    }

    this.repository = repository;
    this.notFoundMessage = notFoundMessage;
  }

  /** Lista los registros de la entidad administrada por el repositorio. */
  listRecords(filterOptions) {
    return this.repository.findAll(filterOptions);
  }

  /** Busca un registro de la entidad por el identificador recibido. */
  getRecordById(recordId) {
    const record = this.repository.findById(recordId);
    if (!record) {
      throw new NotFoundError(this.notFoundMessage);
    }
    return record;
  }

  /** Prepara y guarda un registro nuevo usando las reglas de la clase concreta. */
  createRecord(recordData) {
    const preparedRecordData = this.prepareRecordDataForStorage(recordData ?? {});
    return this.repository.create(preparedRecordData);
  }

  /** Verifica que el registro exista, prepara sus datos y actualiza ese registro. */
  updateRecordById(recordId, recordData) {
    this.getRecordById(recordId);

    const preparedRecordData = this.prepareRecordDataForStorage(recordData ?? {});
    const updatedRecord = this.repository.update(recordId, preparedRecordData);

    if (!updatedRecord) {
      throw new NotFoundError(this.notFoundMessage);
    }

    return updatedRecord;
  }

  /** Elimina un registro existente y devuelve la confirmación de la operación. */
  deleteRecordById(recordId) {
    this.getRecordById(recordId);
    this.repository.delete(recordId);

    return { deleted: true, id: Number(recordId) };
  }

  /**
   * Punto de preparación de datos que personaliza cada servicio concreto.
   * La implementación base no modifica los datos recibidos.
   */
  prepareRecordDataForStorage(recordData) {
    return recordData;
  }

  /** Comprueba que un nombre sea válido y devuelve el texto sin espacios externos. */
  validateAndNormalizeRequiredName(nameValue) {
    if (!nameValue || typeof nameValue !== 'string' || !nameValue.trim()) {
      throw new ValidationError('El nombre es obligatorio');
    }

    return nameValue.trim();
  }

  // Adaptadores temporales: las rutas actuales todavía llaman list/get/create/update/remove.
  // Se conservan para que esta refactorización de services no obligue a modificar routes.
  list(filterOptions) {
    return this.listRecords(filterOptions);
  }

  get(recordId) {
    return this.getRecordById(recordId);
  }

  create(recordData) {
    return this.createRecord(recordData);
  }

  update(recordId, recordData) {
    return this.updateRecordById(recordId, recordData);
  }

  remove(recordId) {
    return this.deleteRecordById(recordId);
  }
}
