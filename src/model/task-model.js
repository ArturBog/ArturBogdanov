import { tasks } from '../mock/task.js';
import { Status } from '../const.js';

export default class TaskModel {
  #tasks = tasks;

  getTasks() {
    return this.#tasks;
  }

  getTasksByStatus(status) {
    return this.#tasks.filter(task => task.status === status);
  }
}