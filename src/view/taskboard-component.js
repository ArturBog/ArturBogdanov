import {createElement} from '../render.js';

function createTaskboardComponentTemplate() {
  return `
    <section class="taskboard">
      <div class="taskboard__inner">
        <!-- Списки задач будут рендериться здесь -->
      </div>
    </section>
  `;
}

export default class TaskboardComponent {
  getTemplate() {
    return createTaskboardComponentTemplate();
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