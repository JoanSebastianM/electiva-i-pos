import CrudService from './CrudService.js';

/** Administra las operaciones y reglas propias de los ingredientes. */
export default class IngredientService extends CrudService {
  constructor(ingredientRepository) {
    super(ingredientRepository, { notFoundMessage: 'Ingrediente no encontrado' });
  }

  /** Lista todos los ingredientes registrados. */
  listIngredients(filterOptions) {
    return this.listRecords(filterOptions);
  }

  /** Busca un ingrediente por su identificador. */
  getIngredientById(ingredientId) {
    return this.getRecordById(ingredientId);
  }

  /** Registra un ingrediente nuevo. */
  createIngredient(ingredientData) {
    return this.createRecord(ingredientData);
  }

  /** Actualiza los datos de un ingrediente existente. */
  updateIngredientById(ingredientId, ingredientData) {
    return this.updateRecordById(ingredientId, ingredientData);
  }

  /** Elimina un ingrediente por su identificador. */
  deleteIngredientById(ingredientId) {
    return this.deleteRecordById(ingredientId);
  }

  /** Normaliza nombre, unidad y existencias antes de guardar el ingrediente. */
  prepareRecordDataForStorage(ingredientData) {
    return this.prepareIngredientData(ingredientData);
  }

  prepareIngredientData(ingredientData) {
    const { name, unit, stock } = ingredientData;

    return {
      name: this.validateAndNormalizeRequiredName(name),
      unit: unit || 'unidad',
      stock: Number(stock ?? 0)
    };
  }
}
