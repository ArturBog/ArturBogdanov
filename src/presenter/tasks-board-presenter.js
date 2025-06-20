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
  #isTrashEmpty = false;
  #draggedTask = null;
  #dragOverList = null;
  #lastFocusedTask = null;

  constructor(container, taskModel) {
    this.#container = container;
    this.#taskModel = taskModel;
    this.#taskModel.on('update', this.#handleModelUpdate.bind(this));
  }

  init() {
    this.#renderBoard();
    this.#setupFormHandlers();
    this.#setupDragAndDrop();
    this.#setupKeyboardNavigation();
    this.#setupLocalStorage();
  }

  #handleModelUpdate() {
    const trashTasks = this.#taskModel.getTasksByStatus(Status.TRASH);
    this.#isTrashEmpty = trashTasks.length === 0;
    
    this.#clearBoard();
    this.#renderAllTasksLists();
  }

  #setupLocalStorage() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        this.#taskModel.tasks = parsedTasks;
        this.#handleModelUpdate();
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }

    this.#taskModel.on('update', (tasks) => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    });
  }

  #setupDragAndDrop() {
    this.#container.addEventListener('dragstart', (evt) => {
      const taskElement = evt.target.closest('.task');
      if (!taskElement) return;

      this.#draggedTask = taskElement;
      taskElement.classList.add('task--dragging');
      evt.dataTransfer.setData('text/plain', taskElement.dataset.taskId);
      evt.dataTransfer.effectAllowed = 'move';
    });

    this.#container.addEventListener('dragover', (evt) => {
      evt.preventDefault();
      const taskList = evt.target.closest('.task-list');
      
      if (taskList) {
        this.#clearDragOverEffects();
        this.#dragOverList = taskList;
        taskList.classList.add('task-list--drag-over');
        
        const afterElement = this.#getDragAfterElement(taskList, evt.clientY);
        const itemsContainer = taskList.querySelector('.task-list__items');
        
        if (afterElement) {
          itemsContainer.insertBefore(this.#draggedTask, afterElement);
        } else {
          itemsContainer.appendChild(this.#draggedTask);
        }
      }
    });

    this.#container.addEventListener('dragleave', () => {
      this.#clearDragOverEffects();
    });

    this.#container.addEventListener('drop', (evt) => {
      evt.preventDefault();
      const taskList = evt.target.closest('.task-list');
      const taskId = evt.dataTransfer.getData('text/plain');

      if (taskList && taskId) {
        const newStatus = taskList.dataset.status;
        this.#taskModel.updateTaskStatus(taskId, newStatus);
      }
      
      this.#clearDragOverEffects();
    });

    this.#container.addEventListener('dragend', () => {
      if (this.#draggedTask) {
        this.#draggedTask.classList.remove('task--dragging');
        this.#draggedTask = null;
      }
      this.#clearDragOverEffects();
    });
  }

  #getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.task--dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  #clearDragOverEffects() {
    if (this.#dragOverList) {
      this.#dragOverList.classList.remove('task-list--drag-over');
      this.#dragOverList = null;
    }
  }

  #setupKeyboardNavigation() {
    this.#container.addEventListener('keydown', (evt) => {
      if (evt.target.classList.contains('task')) {
        this.#handleTaskKeyboardNavigation(evt);
      } else if (evt.key === 'Escape') {
        this.#closeAllEditors();
      }
    });
  }

  #handleTaskKeyboardNavigation(evt) {
    const taskElement = evt.target;
    this.#lastFocusedTask = taskElement;
    const currentStatus = taskElement.closest('.task-list').dataset.status;
    const statusValues = Object.values(Status);
    const currentIndex = statusValues.indexOf(currentStatus);

    if (evt.key === 'ArrowRight') {
      evt.preventDefault();
      const nextStatus = statusValues[Math.min(currentIndex + 1, statusValues.length - 1)];
      this.#moveTaskWithKeyboard(taskElement, nextStatus);
    } else if (evt.key === 'ArrowLeft') {
      evt.preventDefault();
      const prevStatus = statusValues[Math.max(currentIndex - 1, 0)];
      this.#moveTaskWithKeyboard(taskElement, prevStatus);
    } else if (evt.key === 'Delete') {
      evt.preventDefault();
      this.#taskModel.updateTaskStatus(taskElement.dataset.taskId, Status.TRASH);
    } else if (evt.key === 'Enter') {
      evt.preventDefault();
      const taskId = taskElement.dataset.taskId;
      const task = this.#taskModel.tasks.find(t => t.id === taskId);
      if (task) this.#editTask(taskElement, task);
    }
  }

  #moveTaskWithKeyboard(taskElement, newStatus) {
    const taskId = taskElement.dataset.taskId;
    this.#taskModel.updateTaskStatus(taskId, newStatus);
    
    setTimeout(() => {
      const newTaskElement = this.#container.querySelector(`.task[data-task-id="${taskId}"]`);
      if (newTaskElement) newTaskElement.focus();
    }, 50);
  }

  #closeAllEditors() {
    const editInputs = this.#container.querySelectorAll('.task__edit-input');
    editInputs.forEach(input => {
      const textElement = document.createElement('p');
      textElement.className = 'task__text';
      textElement.textContent = input.dataset.originalText;
      input.replaceWith(textElement);
    });
  }

  #renderBoard() {
    if (!this.#container || !this.#taskboardComponent.element) return;
    
    this.#container.append(this.#taskboardComponent.element);
    this.#renderAllTasksLists();
  }

  #clearBoard() {
    const innerContainer = this.#taskboardComponent.element.querySelector('.taskboard__inner');
    if (innerContainer) {
      innerContainer.innerHTML = '';
    }
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

  #renderTaskItems(tasks, container) {
    const tasksContainer = container.querySelector('.task-list__items');
    if (!tasksContainer) return;

    tasksContainer.innerHTML = '';
    tasks.forEach((task) => {
      const taskComponent = new TaskComponent(task);
      const taskElement = taskComponent.element;
      
      taskElement.draggable = true;
      taskElement.tabIndex = 0;
      taskElement.dataset.taskId = task.id;
      taskElement.setAttribute('aria-label', `Задача: ${task.title}. Статус: ${StatusTitle[task.status]}`);
      
      tasksContainer.append(taskElement);

      taskElement.addEventListener('click', (evt) => {
        if (!evt.target.closest('.task__button')) {
          this.#editTask(taskElement, task);
        }
      });

      taskElement.addEventListener('focus', () => {
        this.#lastFocusedTask = taskElement;
      });

      const deleteBtn = taskElement.querySelector('.task__button');
      deleteBtn.setAttribute('aria-label', 'Удалить задачу');
      deleteBtn.addEventListener('click', () => {
        this.#taskModel.updateTaskStatus(task.id, Status.TRASH);
      });
    });

    if (this.#lastFocusedTask) {
      const taskToFocus = this.#container.querySelector(
        `.task[data-task-id="${this.#lastFocusedTask.dataset.taskId}"]`
      );
      if (taskToFocus) taskToFocus.focus();
    }
  }

  #editTask(taskElement, task) {
    const textElement = taskElement.querySelector('.task__text');
    const originalText = task.title;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task__edit-input';
    input.value = originalText;
    input.dataset.originalText = originalText;
    
    textElement.replaceWith(input);
    input.focus();
    
    const finishEditing = () => {
      const newTitle = input.value.trim();
      if (newTitle && newTitle !== originalText) {
        this.#taskModel.updateTaskTitle(task.id, newTitle);
      }
      input.replaceWith(textElement);
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') {
        finishEditing();
      } else if (evt.key === 'Escape') {
        input.value = originalText;
        finishEditing();
      }
    });
  }

  #showEmptyState(status, container) {
    const placeholder = new NoTasksComponent(StatusTitle[status]);
    const itemsContainer = container.querySelector('.task-list__items');
    if (itemsContainer) {
      itemsContainer.append(placeholder.element);
    }
  }

  #setupFormHandlers() {
    const form = document.querySelector('.add-task__form');
    if (!form) return;

    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.#handleTaskCreation(form);
    });

    const input = form.querySelector('.add-task__input');
    input.addEventListener('input', () => {
      if (input.value.trim().length >= 3) {
        input.classList.remove('add-task__input--error');
      }
    });
  }

  #handleTaskCreation(form) {
    const input = form.querySelector('.add-task__input');
    const errorEl = form.querySelector('.add-task__error') || this.#createErrorElement(form);
    const title = input?.value.trim();

    if (!title || title.length < 3) {
      errorEl.textContent = 'Введите не менее 3 символов';
      input.classList.add('add-task__input--error');
      return;
    }

    errorEl.textContent = '';
    input.classList.remove('add-task__input--error');

    this.#taskModel.addTask({
      id: generateID(),
      title,
      status: Status.BACKLOG,
      createdAt: new Date().toISOString()
    });

    input.value = '';
    input.focus();
  }

  #createErrorElement(form) {
    const errorEl = document.createElement('div');
    errorEl.className = 'add-task__error';
    form.appendChild(errorEl);
    return errorEl;
  }

  #setupTrashCleaner(container) {
    const button = container.querySelector('.clear-btn');
    if (!button) return;

    button.disabled = this.#isTrashEmpty;
    button.classList.toggle('clear-btn--disabled', this.#isTrashEmpty);
    if (this.#isTrashEmpty) {
      button.textContent = 'Очищено';
    }

    button.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.#taskModel.clearTasksByStatus(Status.TRASH);
    });
  }

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