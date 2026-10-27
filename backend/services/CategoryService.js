import CrudService from './CrudService.js';
import { ValidationError } from '../errors/AppError.js';

export default class CategoryService extends CrudService {
  constructor(categoryRepository) {
    super(categoryRepository, { notFoundMessage: 'Categoria no encontrada' });
  }

  validateCreate(data) {
    const { name } = data;
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('El nombre es obligatorio');
    }
    return { name: name.trim() };
  }

  validateUpdate(data) {
    return this.validateCreate(data);
  }
}
