import { AbstractComponent } from '../framework/view/abstract-component.js';

export class NoTasksComponent extends AbstractComponent {
  constructor(status) {
    super();
    this.status = status;
  }

  get template() {
    return `
      <div class="no-tasks">
        <p>Нет задач в ${this.status}</p>
      </div>
    `;
  }
}