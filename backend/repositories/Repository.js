/**
 * Contrato base del patron Repository.
 * Cada repositorio concreto define como se obtienen y guardan sus datos.
 */
export default class Repository {
  findAll() {
    throw new Error('findAll() no implementado en el repositorio');
  }

  findById() {
    throw new Error('findById() no implementado en el repositorio');
  }

  create() {
    throw new Error('create() no implementado en el repositorio');
  }

  update() {
    throw new Error('update() no implementado en el repositorio');
  }

  delete() {
    throw new Error('delete() no implementado en el repositorio');
  }
}
