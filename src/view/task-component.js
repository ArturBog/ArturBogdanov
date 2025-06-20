import { AbstractComponent } from '../framework/view/abstract-component.js';
import { Status } from '../const.js';

export default class TaskComponent extends AbstractComponent {
  #task;

  constructor(task) {
    super();
    this.#task = task;
  }

  get template() {
    const isInTrash = this.#task.status === Status.TRASH;
    return `
      <li class="task" draggable="true" data-task-id="${this.#task.id}">
        <p class="task__text">${this.#task.title}</p>
        <div class="task__buttons">
          ${isInTrash ? `
            <button class="task__button task__button--restore" type="button" aria-label="Восстановить задачу">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M1 4.5L4.5 1M4.5 1L8 4.5M4.5 1V9" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          ` : ''}
          <button class="task__button ${isInTrash ? 'task__button--delete' : ''}" type="button" aria-label="Удалить задачу">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </li>
    `;
  }
}