import { AbstractComponent } from '../framework/view/abstract-component.js';

export class HeaderComponent extends AbstractComponent {
  get template() {
    return `
      <header class="board-app__header">
        <div class="board-app__inner">
          <h1>Список задач</h1>
        </div>
      </header>
    `;
  }
}