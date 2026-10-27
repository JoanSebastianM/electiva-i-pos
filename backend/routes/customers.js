import createCrudRouter from './createCrudRouter.js';
import { customerService } from '../container.js';

export default createCrudRouter(customerService, { search: true });
