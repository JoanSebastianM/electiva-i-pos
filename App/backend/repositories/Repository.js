/**
 * Contrato base del patrón Repository (IRepository<T> acorde al diagrama).
 * Cada repositorio concreto define como se obtienen y guardan sus datos.
 */
export default class IRepository {
  findAll() {
    throw new Error('findAll() no implementado en el repositorio');
  }

  findById(id) {
    throw new Error('findById() no implementado en el repositorio');
  }

  create(data) {
    throw new Error('create() no implementado en el repositorio');
  }

  update(id, data) {
    throw new Error('update() no implementado en el repositorio');
  }

  delete(id) {
    throw new Error('delete() no implementado en el repositorio');
  }
}
