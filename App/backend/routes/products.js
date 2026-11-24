import createCrudRouter from './createCrudRouter.js';
import { productService } from '../container.js';

export default createCrudRouter(productService, { search: true });
