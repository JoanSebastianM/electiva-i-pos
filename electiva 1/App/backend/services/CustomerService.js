import CrudService from './CrudService.js';

export default class CustomerService extends CrudService {
  constructor(customerRepository) {
    super(customerRepository, { notFoundMessage: 'Cliente no encontrado' });
  }

  validateCreate(data) {
    const { name, phone } = data;

    return {
      name: this.requireName(name),
      phone: phone || null
    };
  }
}
