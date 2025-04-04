import { createElement } from '../render.js';

function createTaskListComponentTemplate(listConfig) {
  return `
    <div class="task-list" id="${listConfig.id}">
      <h2 class="task-list__title">${listConfig.title}</h2>
      <ul class="task-list__items"></ul>
    </div>
  `;
}

export default class TaskListComponent {
  constructor(listConfig) {
    this.listConfig = listConfig;
  }

  getTemplate() {
    return createTaskListComponentTemplate(this.listConfig);
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