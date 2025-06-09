import { AbstractComponent } from '../framework/view/abstract-component.js';

export default class ErrorViewComponent extends AbstractComponent {
  constructor(message) {
    super();
    this._message = message;
  }

  get template() {
    return `
      <div class="error">
        <p class="error__text">${this._message}</p>
        <button class="error__retry">Попробовать снова</button>
      </div>
    `;
  }

  setRetryHandler(handler) {
    this.getElement().querySelector('.error__retry').addEventListener('click', handler);
  }
}