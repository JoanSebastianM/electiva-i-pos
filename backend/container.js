import ProductRepository from './repositories/ProductRepository.js';
import CategoryRepository from './repositories/CategoryRepository.js';
import IngredientRepository from './repositories/IngredientRepository.js';
import CustomerRepository from './repositories/CustomerRepository.js';
import SaleRepository from './repositories/SaleRepository.js';

import ProductService from './services/ProductService.js';
import CategoryService from './services/CategoryService.js';
import IngredientService from './services/IngredientService.js';
import CustomerService from './services/CustomerService.js';
import InventoryService from './services/InventoryService.js';
import SaleService from './services/SaleService.js';

// Capa 3: acceso a datos
export const productRepository = new ProductRepository();
export const categoryRepository = new CategoryRepository();
export const ingredientRepository = new IngredientRepository();
export const customerRepository = new CustomerRepository();
export const saleRepository = new SaleRepository();

// Capa 2: aplicacion y logica de negocio
export const inventoryService = new InventoryService(productRepository);
export const productService = new ProductService(productRepository);
export const categoryService = new CategoryService(categoryRepository);
export const ingredientService = new IngredientService(ingredientRepository);
export const customerService = new CustomerService(customerRepository);
export const saleService = new SaleService(saleRepository, inventoryService);
