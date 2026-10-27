import CrudService from './CrudService.js';
import { ValidationError } from '../errors/AppError.js';

export default class CustomerService extends CrudService {
  constructor(customerRepository) {
    super(customerRepository, { notFoundMessage: 'Cliente no encontrado' });
  }

  validateCreate(data) {
    const { name, phone } = data;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('El nombre es obligatorio');
    }

    return {
      name: name.trim(),
      phone: phone || null
    };
  }

  validateUpdate(data) {
    return this.validateCreate(data);
  }
}
