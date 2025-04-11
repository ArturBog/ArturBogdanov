import { createElement } from '../render.js';

/**
 * Абстрактный базовый класс для всех компонентов
 * Не может использоваться напрямую, только через наследование
 */
export class AbstractComponent {
  #element = null;  // Приватное поле для хранения DOM-элемента

  constructor() {
    if (new.target === AbstractComponent) {
      throw new Error('Can\'t instantiate AbstractComponent, only concrete one.');
    }
  }

  /**
   * Геттер для получения DOM-элемента
   * Создает элемент при первом обращении
   * @return {HTMLElement}
   */
  get element() {
    if (!this.#element) {
      this.#element = createElement(this.template);
    }
    return this.#element;
  }

  /**
   * Абстрактный геттер шаблона компонента
   * Должен быть переопределен в дочерних классах
   * @throw {Error} При попытке вызвать напрямую
   */
  get template() {
    throw new Error('Abstract method not implemented: get template');
  }

  /**
   * Удаляет ссылку на DOM-элемент
   * Для полного удаления нужно вызывать remove() у самого элемента
   */
  removeElement() {
    this.#element = null;
  }

  /**
   * Показать компонент
   */
  show() {
    this.element.style.display = '';
  }

  /**
   * Скрыть компонент
   */
  hide() {
    this.element.style.display = 'none';
  }
}