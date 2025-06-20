import { AbstractComponent } from '../framework/view/abstract-component.js';

export default class TaskboardComponent extends AbstractComponent {
  get template() {
    return `
      <section class="taskboard">
        <div class="taskboard__inner"></div>
      </section>
    `;
  }
}