import CrudService from './CrudService.js';

/** Administra las operaciones y reglas propias de las categorías. */
export default class CategoryService extends CrudService {
  constructor(categoryRepository) {
    super(categoryRepository, { notFoundMessage: 'Categoria no encontrada' });
  }

  /** Lista todas las categorías disponibles. */
  listCategories(filterOptions) {
    return this.listRecords(filterOptions);
  }

  /** Busca una categoría por su identificador. */
  getCategoryById(categoryId) {
    return this.getRecordById(categoryId);
  }

  /** Registra una categoría nueva después de validar su nombre. */
  createCategory(categoryData) {
    return this.createRecord(categoryData);
  }

  /** Actualiza los datos de una categoría existente. */
  updateCategoryById(categoryId, categoryData) {
    return this.updateRecordById(categoryId, categoryData);
  }

  /** Elimina una categoría por su identificador. */
  deleteCategoryById(categoryId) {
    return this.deleteRecordById(categoryId);
  }

  /** Aplica las reglas de datos que debe cumplir una categoría. */
  prepareRecordDataForStorage(categoryData) {
    return this.prepareCategoryData(categoryData);
  }

  prepareCategoryData(categoryData) {
    return {
      name: this.validateAndNormalizeRequiredName(categoryData.name)
    };
  }
}
