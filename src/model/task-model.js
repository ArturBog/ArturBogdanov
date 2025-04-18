import { Status } from '../const.js';
import { EventEmitter } from './event-emitter.js';

export class TaskModel extends EventEmitter {
  #tasks = [];

  constructor(initialTasks = []) {
    super();
    this.#tasks = initialTasks;
  }

  get tasks() {
    return this.#tasks;
  }

  addTask(task) {
    this.#tasks.push(task);
    this.emit('update', this.#tasks);
  }

  clearTasksByStatus(status) {
    this.#tasks = this.#tasks.filter(task => task.status !== status);
    this.emit('update', this.#tasks);
  }

  getTasksByStatus(status) {
    return this.#tasks.filter(task => task.status === status);
  }
  addTask(task) {
    this.#tasks.push(task);
    this.emit('update', this.#tasks); // Для наблюдателя
  }
  clearTasksByStatus(status) {
    this.#tasks = this.#tasks.filter(task => task.status !== status);
    this.emit('update', this.#tasks);
  }
}
