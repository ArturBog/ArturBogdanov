import { createElement } from '../render.js';

function createTaskListComponentTemplate(title, status) {
  return `
    <div class="task-list" data-status="${status}">
      <h2 class="task-list__title">${title}</h2>
      <ul class="task-list__items"></ul>
      ${status === 'trash' ? '<button class="clear-btn">Очистить</button>' : ''}
    </div>
  `;
}

export default class TaskListComponent {
  constructor(title, status) {
    this.title = title;
    this.status = status;
  }

  getTemplate() {
    return createTaskListComponentTemplate(this.title, this.status);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}