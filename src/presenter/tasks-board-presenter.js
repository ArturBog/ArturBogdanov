import { Status, StatusTitle, UpdateType, UserAction } from '../const.js';
import TaskboardComponent from '../view/taskboard-component.js';
import TaskListComponent from '../view/task-list-component.js';
import TaskComponent from '../view/task-component.js';
import NoTasksComponent from '../view/no-tasks-component.js';
import LoadingViewComponent from '../view/loading-view-component.js';
import ErrorViewComponent from '../view/error-view-component.js';
import { generateId } from '../utils.js';

export default class TasksBoardPresenter {
  #taskModel = null;
  #taskboardComponent = new TaskboardComponent();
  #container = null;
  #formContainer = null;
  #loadingComponent = null;
  #errorComponent = null;
  #draggedTask = null;
  #dragOverList = null;

  constructor({ container, formContainer, taskModel }) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('Invalid container element');
    }
    if (!taskModel || typeof taskModel.addObserver !== 'function') {
      throw new Error('Valid TaskModel is required');
    }

    this.#container = container;
    this.#formContainer = formContainer;
    this.#taskModel = taskModel;
    this.#taskModel.addObserver(this.#handleModelEvent);
  }

  async init() {
    this.#showLoading();
    try {
      await this.#taskModel.init();
      this.#renderBoard();
      this.#setupEventHandlers();
      this.#setupDragAndDrop();
      this.#setupKeyboardNavigation();
    } catch (error) {
      console.error('Error in presenter init:', error);
      this.#showError('Не удалось загрузить задачи');
    } finally {
      this.#hideLoading();
    }
  }

  #showLoading() {
    this.#loadingComponent = new LoadingViewComponent();
    this.#container.append(this.#loadingComponent.element);
  }

  #hideLoading() {
    if (this.#loadingComponent) {
      this.#loadingComponent.element.remove();
      this.#loadingComponent = null;
    }
  }

  #showError(message) {
    this.#hideError();
    this.#errorComponent = new ErrorViewComponent(message);
    this.#container.append(this.#errorComponent.element);
  }

  #hideError() {
    if (this.#errorComponent) {
      this.#errorComponent.element.remove();
      this.#errorComponent = null;
    }
  }

  #handleModelEvent = (updateType, payload) => {
    console.log('Model event:', updateType, payload);
    switch (updateType) {
      case UpdateType.INIT:
        this.#updateBoard();
        break;
      case UpdateType.PATCH:
        this.#updateTaskView(payload);
        break;
      case UserAction.ADD_TASK:
      case UserAction.DELETE_TASK:
      case UpdateType.MINOR:
      case UpdateType.MAJOR:
        this.#updateBoard();
        break;
      case UpdateType.ERROR:
        this.#showError(payload?.message || 'Ошибка при обновлении данных');
        break;
    }
  };

  #renderBoard() {
    console.log('Rendering board...');
    this.#clearBoard();
    this.#container.append(this.#taskboardComponent.element);
    this.#renderAllTasksLists();
  }

  #updateBoard() {
    console.log('Updating board...');
    this.#clearBoard();
    this.#renderAllTasksLists();
  }

  #clearBoard() {
    const taskboardInner = this.#taskboardComponent.element.querySelector('.taskboard__inner');
    if (taskboardInner) {
      taskboardInner.innerHTML = '';
    }
  }

  #renderAllTasksLists() {
    const taskboardInner = this.#taskboardComponent.element.querySelector('.taskboard__inner');
    if (!taskboardInner) {
      console.error('Taskboard inner container not found');
      return;
    }

    console.log('Rendering all task lists...');
    Object.values(Status).forEach((status) => {
      this.#renderTaskList(status, taskboardInner);
    });
  }

  #renderTaskList(status, container) {
    const tasks = this.#taskModel.getTasksByStatus(status);
    console.log(`Rendering task list for status ${status}:`, tasks);
    
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

  #renderTaskItems(tasks, container) {
    const tasksContainer = container.querySelector('.task-list__items');
    if (!tasksContainer) {
      console.error('Tasks container not found');
      return;
    }

    console.log('Rendering task items:', tasks);
    tasks.forEach((task) => {
      const taskComponent = new TaskComponent(task);
      const taskElement = taskComponent.element;
      
      taskElement.draggable = true;
      taskElement.tabIndex = 0;
      taskElement.dataset.taskId = task.id;
      
      tasksContainer.append(taskElement);

      taskElement.addEventListener('click', (evt) => {
        if (!evt.target.closest('.task__button')) {
          this.#editTask(taskElement, task);
        }
      });

      const restoreBtn = taskElement.querySelector('.task__button--restore');
      if (restoreBtn) {
        restoreBtn.addEventListener('click', async () => {
          try {
            await this.#taskModel.restoreFromTrash(task.id);
          } catch (error) {
            this.#showError('Не удалось восстановить задачу');
          }
        });
      }

      const deleteBtn = taskElement.querySelector('.task__button:not(.task__button--restore)');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          this.#taskModel.updateTaskStatus(task.id, Status.TRASH);
        });
      }
    });
  }

  #setupEventHandlers() {
    const form = this.#formContainer.querySelector('.add-task__form');
    if (form) {
      form.addEventListener('submit', async (evt) => {
        evt.preventDefault();
        const input = form.querySelector('.add-task__input');
        const title = input?.value.trim();

        if (!title || title.length < 3) {
          return;
        }

        try {
          const button = form.querySelector('.add-task__button');
          button.disabled = true;
          await this.#taskModel.addTask(title);
          input.value = '';
        } catch (error) {
          this.#showError('Не удалось добавить задачу');
        } finally {
          const button = form.querySelector('.add-task__button');
          button.disabled = false;
        }
      });
    } else {
      console.error('Form not found in formContainer');
    }
  }

  #setupDragAndDrop() {
    this.#container.addEventListener('dragstart', (evt) => {
      const taskElement = evt.target.closest('.task');
      if (!taskElement || taskElement.closest('.task-list').dataset.status === Status.TRASH) return;

      this.#draggedTask = taskElement;
      taskElement.classList.add('task--dragging');
      evt.dataTransfer.setData('text/plain', taskElement.dataset.taskId);
      evt.dataTransfer.effectAllowed = 'move';
    });

    this.#container.addEventListener('dragover', (evt) => {
      evt.preventDefault();
      const taskList = evt.target.closest('.task-list');
      if (!taskList || taskList.dataset.status === Status.TRASH) return;

      evt.dataTransfer.dropEffect = 'move';
      this.#clearDragOverEffects();
      this.#dragOverList = taskList;
      taskList.classList.add('task-list--drag-over');
    });

    this.#container.addEventListener('drop', async (evt) => {
      evt.preventDefault();
      const taskList = evt.target.closest('.task-list');
      if (!taskList || !this.#draggedTask || taskList.dataset.status === Status.TRASH) return;

      try {
        const taskId = this.#draggedTask.dataset.taskId;
        const newStatus = taskList.dataset.status;
        await this.#taskModel.updateTaskStatus(taskId, newStatus);
      } catch (error) {
        this.#showError('Не удалось обновить статус задачи');
      } finally {
        this.#clearDragOverEffects();
      }
    });

    this.#container.addEventListener('dragend', () => {
      this.#clearDragOverEffects();
      if (this.#draggedTask) {
        this.#draggedTask.classList.remove('task--dragging');
        this.#draggedTask = null;
      }
    });
  }

  #setupTrashCleaner(container) {
    const clearBtn = container.querySelector('.clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        try {
          await this.#taskModel.clearBasketTasks();
        } catch (error) {
          this.#showError('Не удалось очистить корзину');
        }
      });
    }
  }

  #setupKeyboardNavigation() {
    const handleKeyDown = (evt) => {
      if (!evt.target.classList.contains('task')) return;

      const taskElement = evt.target;
      const currentStatus = taskElement.closest('.task-list').dataset.status;
      const statusOrder = Object.values(Status);
      const currentIndex = statusOrder.indexOf(currentStatus);

      switch (evt.key) {
        case 'ArrowRight':
          evt.preventDefault();
          this.#taskModel.updateTaskStatus(
            taskElement.dataset.taskId,
            statusOrder[Math.min(currentIndex + 1, statusOrder.length - 1)]
          );
          break;
        case 'ArrowLeft':
          evt.preventDefault();
          this.#taskModel.updateTaskStatus(
            taskElement.dataset.taskId,
            statusOrder[Math.max(currentIndex - 1, 0)]
          );
          break;
        case 'Delete':
          evt.preventDefault();
          this.#taskModel.updateTaskStatus(
            taskElement.dataset.taskId,
            Status.TRASH
          );
          break;
      }
    };

    this.#container.addEventListener('keydown', handleKeyDown);
  }

  #editTask(taskElement, task) {
    const textElement = taskElement.querySelector('.task__text');
    const originalText = task.title;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.className = 'task__edit-input';
    
    textElement.replaceWith(input);
    input.focus();

    const finishEditing = () => {
      const newTitle = input.value.trim();
      if (newTitle && newTitle !== originalText) {
        this.#taskModel.updateTask(UpdateType.PATCH, {
          ...task,
          title: newTitle
        });
      }
      input.replaceWith(textElement);
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') finishEditing();
      if (evt.key === 'Escape') {
        input.value = originalText;
        finishEditing();
      }
    });
  }

  #showEmptyState(status, container) {
    const placeholder = new NoTasksComponent(StatusTitle[status]);
    const itemsContainer = container.querySelector('.task-list__items');
    if (itemsContainer) itemsContainer.append(placeholder.element);
  }

  #updateTaskView(updatedTask) {
    const taskElement = this.#container.querySelector(`[data-task-id="${updatedTask.id}"]`);
    if (taskElement) {
      taskElement.replaceWith(new TaskComponent(updatedTask).element);
    }
  }

  #clearDragOverEffects() {
    if (this.#dragOverList) {
      this.#dragOverList.classList.remove('task-list--drag-over');
      this.#dragOverList = null;
    }
  }

  destroy() {
    this.#container.innerHTML = '';
    this.#taskModel.removeObserver(this.#handleModelEvent);
  }
}