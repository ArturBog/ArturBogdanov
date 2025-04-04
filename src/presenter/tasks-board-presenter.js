import { Status, StatusTitle } from '../const.js';
import TaskModel from '../model/task-model.js';
import TaskboardComponent from '../view/taskboard-component.js';
import TaskListComponent from '../view/task-list-component.js';
import TaskComponent from '../view/task-component.js';

export default class TasksBoardPresenter {
  #taskModel = new TaskModel();
  #taskboardComponent = new TaskboardComponent();
  #container = null;

  constructor(container) {
    this.#container = container;
  }

  init() {
    this.#renderTaskBoard();
    this.#renderTaskLists();
  }

  #renderTaskBoard() {
    this.#container.appendChild(this.#taskboardComponent.getElement());
  }

  #renderTaskLists() {
    const taskboardInner = this.#taskboardComponent.getElement().querySelector('.taskboard__inner');

    Object.values(Status).forEach((status) => {
      const tasks = this.#taskModel.getTasksByStatus(status);
      const taskListComponent = new TaskListComponent(StatusTitle[status], status);
      taskboardInner.appendChild(taskListComponent.getElement());

      this.#renderTasks(tasks, taskListComponent);
    });
  }

  #renderTasks(tasks, taskListComponent) {
    const tasksContainer = taskListComponent.getElement().querySelector('.task-list__items');
    
    tasks.forEach((task) => {
      const taskComponent = new TaskComponent(task);
      tasksContainer.appendChild(taskComponent.getElement());
    });
  }
}