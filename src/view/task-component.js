import {createElement} from '../render.js';

function createTaskComponentTemplate(taskText) {
  return `
    <li class="task">
      <p class="task__text">${taskText}</p>
      <button class="task__button" type="button" aria-label="Удалить задачу">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </li>
  `;
}

export default class TaskComponent {
  constructor(taskText) {
    this.taskText = taskText;
  }

  getTemplate() {
    return createTaskComponentTemplate(this.taskText);
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