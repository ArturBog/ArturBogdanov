import { AbstractComponent } from '../framework/view/abstract-component.js';

export class FormAddTaskComponent extends AbstractComponent {
  get template() {
    return `
      <form class="add-task__form">
        <input 
          type="text" 
          class="add-task__input" 
          placeholder="Введите задачу..."
          required
          minlength="3"
        >
        <button class="add-task__button" type="submit">
          Добавить
        </button>
      </form>
    `;
  }
}