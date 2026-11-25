import ProductRepository from './repositories/ProductRepository.js';
import CategoryRepository from './repositories/CategoryRepository.js';
import IngredientRepository from './repositories/IngredientRepository.js';
import CustomerRepository from './repositories/CustomerRepository.js';
import SaleRepository from './repositories/SaleRepository.js';
import SaleItemRepository from './repositories/SaleItemRepository.js';
import ProductIngredientRepository from './repositories/ProductIngredientRepository.js';
import UserRepository from './repositories/UserRepository.js';
import SessionRepository from './repositories/SessionRepository.js';

import { getDb, transaction } from './db.js';
import ProductService from './services/ProductService.js';
import CategoryService from './services/CategoryService.js';
import IngredientService from './services/IngredientService.js';
import CustomerService from './services/CustomerService.js';
import InventoryService from './services/InventoryService.js';
import SaleService from './services/SaleService.js';
import AuthService from './services/AuthService.js';
import UserService from './services/UserService.js';
import SessionService from './services/SessionService.js';
import RecipeService from './services/RecipeService.js';

export const productRepository = new ProductRepository();
export const categoryRepository = new CategoryRepository();
export const ingredientRepository = new IngredientRepository();
export const customerRepository = new CustomerRepository();
export const saleRepository = new SaleRepository();
export const saleItemRepository = new SaleItemRepository();
export const productIngredientRepository = new ProductIngredientRepository();
export const userRepository = new UserRepository();
export const sessionRepository = new SessionRepository(getDb());

export const inventoryService = new InventoryService({
  products: productRepository,
  ingredients: ingredientRepository,
  recipes: productIngredientRepository
});
export const productService = new ProductService(productRepository);
export const categoryService = new CategoryService(categoryRepository);
export const ingredientService = new IngredientService(ingredientRepository);
export const customerService = new CustomerService(customerRepository);
export const authService = new AuthService(userRepository);
export const userService = new UserService(userRepository);
export const sessionService = new SessionService({
  sessions: sessionRepository,
  users: userRepository
});
export const recipeService = new RecipeService({
  recipes: productIngredientRepository,
  ingredients: ingredientRepository,
  products: productRepository,
  transaction
});
export const saleService = new SaleService({
  sales: saleRepository,
  saleItems: saleItemRepository,
  inventory: inventoryService,
  transaction
});
