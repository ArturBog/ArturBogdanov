import { Status, StatusTitle } from '../const.js';
import { TaskModel } from '../model/task-model.js';
import { TaskboardComponent } from '../view/taskboard-component.js';
import { TaskListComponent } from '../view/task-list-component.js';
import { TaskComponent } from '../view/task-component.js';
import { NoTasksComponent } from '../view/no-tasks-component.js';
import { generateID } from '../utils.js';

export class TasksBoardPresenter {
  #taskModel;
  #taskboardComponent = new TaskboardComponent();
  #container = null;

  constructor(container, taskModel) {
    this.#container = container;
    this.#taskModel = taskModel;
    this.#taskModel.on('update', () => this.#onModelUpdate());
  }

  init() {
    this.#renderBoard();
    this.#setupFormHandlers();
  }

  #onModelUpdate() {
    this.#clearBoard();
    this.#renderAllTasksLists();
  }

  #clearBoard() {
    const innerContainer = this.#taskboardComponent.element.querySelector('.taskboard__inner');
    if (innerContainer) {
      innerContainer.innerHTML = '';
    }
  }

  #renderBoard() {
    if (!this.#container || !this.#taskboardComponent.element) return;
    
    this.#container.append(this.#taskboardComponent.element);
    this.#renderAllTasksLists();
  }

  #renderAllTasksLists() {
    const taskboardInner = this.#taskboardComponent.element.querySelector('.taskboard__inner');
    if (!taskboardInner) return;

    Object.values(Status).forEach((status) => {
      this.#renderTaskList(status, taskboardInner);
    });
  }

  #renderTaskList(status, container) {
    const tasks = this.#taskModel.getTasksByStatus(status);
    const taskListComponent = new TaskListComponent(StatusTitle[status], status);
    
    container.append(taskListComponent.element);
    
    if (tasks.length === 0) {
      this.#showEmptyState(status, taskListComponent.element);
    } else {
      this.#renderTaskItems(tasks, taskListComponent.element);
    }

    if (status === Status.TRASH) {
      this.#setupTrashCleaner(taskListComponent.element);
    }
  }

  #setupFormHandlers() {
    const form = document.querySelector('.add-task__form');
    if (!form) return;

    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.#handleTaskCreation(form);
    });
  }

  #handleTaskCreation(form) {
    const input = form.querySelector('.add-task__input');
    const title = input?.value.trim();

    if (!title || title.length < 3) return;

    this.#taskModel.addTask({
      id: generateID(),
      title,
      status: Status.BACKLOG,
      createdAt: new Date().toISOString()
    });

    input.value = '';
    input.focus();
  }

  #setupTrashCleaner(container) {
    const button = container.querySelector('.clear-btn');
    if (!button) return;

    button.addEventListener('click', () => {
      this.#taskModel.clearTasksByStatus(Status.TRASH);
      button.disabled = true;
      button.textContent = 'Очищено';
    });
  }

  #renderTaskItems(tasks, container) {
    const tasksContainer = container.querySelector('.task-list__items');
    if (!tasksContainer) return;

    tasks.forEach((task) => {
      const taskComponent = new TaskComponent(task);
      tasksContainer.append(taskComponent.element);
    });
  }

  #showEmptyState(status, container) {
    const placeholder = new NoTasksComponent(StatusTitle[status]);
    const itemsContainer = container.querySelector('.task-list__items');
    if (itemsContainer) {
      itemsContainer.append(placeholder.element);
    }
  }

  // Публичный метод для внешнего управления
  addTask(title) {
    if (!title || title.length < 3) return false;
    
    this.#taskModel.addTask({
      id: generateID(),
      title,
      status: Status.BACKLOG,
      createdAt: new Date().toISOString()
    });
    
    return true;
  }
}