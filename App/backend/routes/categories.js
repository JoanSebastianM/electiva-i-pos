import createCrudRouter from './createCrudRouter.js';
import { categoryService } from '../container.js';

export default createCrudRouter(categoryService);
