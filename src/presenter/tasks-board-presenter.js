import { Status, StatusTitle } from '../const.js';
import { TaskModel } from '../model/task-model.js';
import { TaskboardComponent } from '../view/taskboard-component.js';
import { TaskListComponent } from '../view/task-list-component.js';
import { TaskComponent } from '../view/task-component.js';
import { NoTasksComponent } from '../view/no-tasks-component.js';

export class TasksBoardPresenter {
  #taskModel = new TaskModel();
  #taskboardComponent = new TaskboardComponent();
  #container = null;

  constructor(container) {
    this.#container = container;
  }

  init() {
    this.#renderBoard();
  }

  #renderBoard() {
    this.#renderTaskBoard();
    this.#renderAllTasksLists();
  }

  #renderTaskBoard() {
    this.#container.append(this.#taskboardComponent.element);
  }

  #renderAllTasksLists() {
    const taskboardInner = this.#taskboardComponent.element.querySelector('.taskboard__inner');
    
    Object.values(Status).forEach((status) => {
      this.#renderTasksList(status, taskboardInner);
    });
  }

  #renderTasksList(status, container) {
    const tasks = this.#taskModel.getTasksByStatus(status);
    const taskListComponent = new TaskListComponent(StatusTitle[status], status);
    
    container.append(taskListComponent.element);
    
    if (tasks.length === 0) {
      this.#renderNoTasksPlaceholder(status, taskListComponent.element);
    } else {
      this.#renderTasks(tasks, taskListComponent.element);
    }

    // Важное изменение: перенесли логику кнопки в компонент списка
    if (status === Status.TRASH) {
      taskListComponent.setClearButtonHandler(() => {
        this.#clearTrashList(taskListComponent.element);
      });
    }
  }

  #renderTasks(tasks, container) {
    const tasksContainer = container.querySelector('.task-list__items');
    
    tasks.forEach((task) => {
      const taskComponent = new TaskComponent(task);
      tasksContainer.append(taskComponent.element);
    });
  }

  #renderNoTasksPlaceholder(status, container) {
    const placeholder = new NoTasksComponent(StatusTitle[status]);
    container.querySelector('.task-list__items').append(placeholder.element);
  }

  #clearTrashList(container) {
    container.querySelector('.task-list__items').innerHTML = '';
    this.#renderNoTasksPlaceholder(Status.TRASH, container);
  }
}