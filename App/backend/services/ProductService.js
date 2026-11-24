import CrudService from './CrudService.js';
import { ValidationError } from '../errors/AppError.js';

/** Administra las operaciones y reglas propias de los productos. */
export default class ProductService extends CrudService {
  constructor(productRepository) {
    super(productRepository, { notFoundMessage: 'Producto no encontrado' });
  }

  /** Lista todos los productos que coinciden con los filtros recibidos. */
  listProducts(filterOptions) {
    return this.listRecords(filterOptions);
  }

  /** Busca un producto por su identificador. */
  getProductById(productId) {
    return this.getRecordById(productId);
  }

  /** Registra un producto después de comprobar sus datos y su precio. */
  createProduct(productData) {
    return this.createRecord(productData);
  }

  /** Actualiza los datos de un producto existente. */
  updateProductById(productId, productData) {
    return this.updateRecordById(productId, productData);
  }

  /** Elimina un producto por su identificador. */
  deleteProductById(productId) {
    return this.deleteRecordById(productId);
  }

  /** Normaliza y valida los datos específicos de un producto. */
  prepareRecordDataForStorage(productData) {
    return this.prepareProductData(productData);
  }

  prepareProductData(productData) {
    const { name, categoryId, price, stock } = productData;
    const normalizedName = this.validateAndNormalizeRequiredName(name);

    if (price == null || isNaN(Number(price)) || Number(price) < 0) {
      throw new ValidationError('El precio debe ser un numero mayor o igual a 0');
    }

    return {
      name: normalizedName,
      categoryId: categoryId || null,
      price: Number(price),
      stock: Number(stock ?? 0)
    };
  }
}
