import Observable from '../framework/observable.js';
import { UpdateType, UserAction, Status } from '../const.js';
import { generateId } from '../utils.js';

const STORAGE_KEY = 'taskManagerTasks';

export default class TaskModel extends Observable {
  #tasksApiService = null;
  #tasks = [];

  constructor({ tasksApiService }) {
    super();
    this.#tasksApiService = tasksApiService;
  }

  get tasks() {
    return this.#tasks;
  }

  getTasksByStatus(status) {
    return this.#tasks.filter(task => task.status === status);
  }

  async init() {
    try {
      // Пытаемся загрузить задачи из localStorage
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        this.#tasks = JSON.parse(savedTasks);
        this._notify(UpdateType.INIT);
        return;
      }

      // Если в localStorage ничего нет, загружаем с сервера
      const tasks = await this.#tasksApiService.tasks;
      console.log('Tasks received in model:', tasks);
      this.#tasks = tasks.map(this.#adaptToClient);
      this.#saveTasks();
      console.log('Tasks after adaptation:', this.#tasks);
      this._notify(UpdateType.INIT);
    } catch(err) {
      console.error('Error in init:', err);
      this.#tasks = [];
      this._notify(UpdateType.ERROR, err);
    }
  }

  async addTask(title) {
    const newTask = {
      title,
      status: Status.BACKLOG,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    try {
      const createdTask = await this.#tasksApiService.addTask(newTask);
      this.#tasks = [createdTask, ...this.#tasks];
      this.#saveTasks();
      this._notify(UserAction.ADD_TASK, createdTask);
      return createdTask;
    } catch(err) {
      console.error('Error adding task:', err);
      throw err;
    }
  }

  async updateTaskStatus(taskId, newStatus) {
    const task = this.#tasks.find(task => task.id === taskId);
    if (!task) return;

    const previousStatus = task.status;
    task.status = newStatus;

    try {
      const updatedTask = await this.#tasksApiService.updateTask(task);
      this.#tasks = this.#tasks.map(t => t.id === taskId ? updatedTask : t);
      this.#saveTasks();
      this._notify(UserAction.UPDATE_TASK, updatedTask);
    } catch(err) {
      console.error('Error updating task:', err);
      task.status = previousStatus;
      throw err;
    }
  }

  async restoreFromTrash(taskId) {
    const task = this.#tasks.find(task => task.id === taskId);
    if (!task || task.status !== Status.TRASH) return;

    try {
      task.status = Status.BACKLOG;
      const updatedTask = await this.#tasksApiService.updateTask(task);
      this.#tasks = this.#tasks.map(t => t.id === taskId ? updatedTask : t);
      this.#saveTasks();
      this._notify(UserAction.UPDATE_TASK, updatedTask);
    } catch(err) {
      console.error('Error restoring task:', err);
      task.status = Status.TRASH;
      throw err;
    }
  }

  async clearBasketTasks() {
    const basketTasks = this.#tasks.filter(task => task.status === Status.TRASH);
    try {
      await Promise.all(basketTasks.map(task => 
        this.#tasksApiService.deleteTask(task.id)
      ));
      this.#tasks = this.#tasks.filter(task => task.status !== Status.TRASH);
      this.#saveTasks();
      this._notify(UserAction.DELETE_TASK, { status: Status.TRASH });
    } catch(err) {
      console.error('Error clearing trash:', err);
      throw err;
    }
  }

  hasBasketTasks() {
    return this.#tasks.some(task => task.status === Status.TRASH);
  }

  #saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#tasks));
  }

  #adaptToClient(task) {
    return {
      id: task.id,
      title: task.title,
      status: task.status || Status.BACKLOG,
      createdAt: task.createdAt || new Date().toISOString()
    };
  }
}