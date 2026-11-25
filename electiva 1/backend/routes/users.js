import createCrudRouter from './createCrudRouter.js';
import { userService } from '../container.js';

export default createCrudRouter(userService, { search: true });
