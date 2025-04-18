import { AbstractComponent } from '../framework/view/abstract-component.js';

export class TaskComponent extends AbstractComponent {
  #task;

  constructor(task) {
    super();
    this.#task = task;
  }

  get template() {
    return `
      <li class="task" data-task-id="${this.#task.id}">
        <p class="task__text">${this.#task.title}</p>
        <button class="task__button" type="button">
          <svg width="12" height="12"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor"/></svg>
        </button>
      </li>
    `;
  }
}