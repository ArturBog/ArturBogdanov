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

updateTaskStatus(taskId, newStatus) {
  const task = this.#tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    this.emit('update', this.#tasks);
  }
}
 updateTaskStatus(taskId, newStatus) {
    const task = this.#tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      task.status = newStatus;
      this.emit('update', this.#tasks);
      return true;
    }
    return false;
  }
  updateTaskTitle(taskId, newTitle) {
  const task = this.#tasks.find(t => t.id === taskId);
  if (task && task.title !== newTitle) {
    task.title = newTitle;
    this.emit('update', this.#tasks);
  }
}
}
