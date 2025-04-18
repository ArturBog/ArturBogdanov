import { AbstractComponent } from '../framework/view/abstract-component.js';
import { Status } from '../const.js';

export class TaskListComponent extends AbstractComponent {
  #title;
  #status;

  constructor(title, status) {
    super();
    this.#title = title;
    this.#status = status;
  }

  get template() {
    return `
      <div class="task-list" data-status="${this.#status}">
        <h2 class="task-list__title">${this.#title}</h2>
        <ul class="task-list__items"></ul>
      </div>
    `;
  }

  setClearButtonHandler(handler) {
    if (this.#status === Status.TRASH) {
      const button = document.createElement('button');
      button.className = 'clear-btn';
      button.textContent = 'Очистить';
      button.addEventListener('click', handler);
      this.element.append(button);
    }
  }
}