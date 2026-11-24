import CrudService from './CrudService.js';

/** Administra las operaciones y reglas propias de los clientes. */
export default class CustomerService extends CrudService {
  constructor(customerRepository) {
    super(customerRepository, { notFoundMessage: 'Cliente no encontrado' });
  }

  /** Lista todos los clientes registrados. */
  listCustomers(filterOptions) {
    return this.listRecords(filterOptions);
  }

  /** Busca un cliente por su identificador. */
  getCustomerById(customerId) {
    return this.getRecordById(customerId);
  }

  /** Registra un cliente nuevo. */
  createCustomer(customerData) {
    return this.createRecord(customerData);
  }

  /** Actualiza los datos de un cliente existente. */
  updateCustomerById(customerId, customerData) {
    return this.updateRecordById(customerId, customerData);
  }

  /** Elimina un cliente por su identificador. */
  deleteCustomerById(customerId) {
    return this.deleteRecordById(customerId);
  }

  /** Normaliza los datos del cliente antes de guardarlos. */
  prepareRecordDataForStorage(customerData) {
    return this.prepareCustomerData(customerData);
  }

  prepareCustomerData(customerData) {
    const { name, phone } = customerData;

    return {
      name: this.validateAndNormalizeRequiredName(name),
      phone: phone || null
    };
  }
}
