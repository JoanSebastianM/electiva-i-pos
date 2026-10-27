import CrudService from './CrudService.js';
import { ValidationError } from '../errors/AppError.js';

export default class ProductService extends CrudService {
  constructor(productRepository) {
    super(productRepository, { notFoundMessage: 'Producto no encontrado' });
  }

  validateCreate(data) {
    const { name, categoryId, price, stock } = data;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('El nombre es obligatorio');
    }
    if (price == null || isNaN(Number(price)) || Number(price) < 0) {
      throw new ValidationError('El precio debe ser un numero mayor o igual a 0');
    }

    return {
      name: name.trim(),
      categoryId: categoryId || null,
      price: Number(price),
      stock: Number(stock ?? 0)
    };
  }

  validateUpdate(data) {
    return this.validateCreate(data);
  }
}
