import CrudService from './CrudService.js';

export default class IngredientService extends CrudService {
  constructor(ingredientRepository) {
    super(ingredientRepository, { notFoundMessage: 'Ingrediente no encontrado' });
  }

  validateCreate(data) {
    const { name, unit, stock } = data;

    return {
      name: this.requireName(name),
      unit: unit || 'unidad',
      stock: Number(stock ?? 0)
    };
  }
}
