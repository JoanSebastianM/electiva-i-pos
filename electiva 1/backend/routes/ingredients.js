import createCrudRouter from './createCrudRouter.js';
import { ingredientService } from '../container.js';

export default createCrudRouter(ingredientService);
