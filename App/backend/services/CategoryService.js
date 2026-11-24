import CrudService from './CrudService.js';

export default class CategoryService extends CrudService {
  constructor(categoryRepository) {
    super(categoryRepository, { notFoundMessage: 'Categoria no encontrada' });
  }

  validateCreate(data) {
    return { name: this.requireName(data.name) };
  }
}
