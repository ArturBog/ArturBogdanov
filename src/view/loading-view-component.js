import { AbstractComponent } from '../framework/view/abstract-component.js';

export default class LoadingViewComponent extends AbstractComponent {
  get template() {
    return `
      <div class="loading">
        <p class="loading__text">Загрузка...</p>
        <div class="loading__spinner"></div>
      </div>
    `;
  }
} 