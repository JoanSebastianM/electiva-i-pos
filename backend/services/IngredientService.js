import CrudService from './CrudService.js';
import { ValidationError } from '../errors/AppError.js';

export default class IngredientService extends CrudService {
  constructor(ingredientRepository) {
    super(ingredientRepository, { notFoundMessage: 'Ingrediente no encontrado' });
  }

  validateCreate(data) {
    const { name, unit, stock } = data;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('El nombre es obligatorio');
    }

    return {
      name: name.trim(),
      unit: unit || 'unidad',
      stock: Number(stock ?? 0)
    };
  }

  validateUpdate(data) {
    return this.validateCreate(data);
  }
}
