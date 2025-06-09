import { AbstractComponent } from '../framework/view/abstract-component.js';

export default class ErrorViewComponent extends AbstractComponent {
  #message;

  constructor(message) {
    super();
    this.#message = message;
  }

  get template() {
    return `
      <div class="error">
        <p class="error__text">${this.#message}</p>
      </div>
    `;
  }
} 