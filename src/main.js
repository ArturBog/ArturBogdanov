import { HeaderComponent } from './view/header-component.js';
import { FormAddTaskComponent } from './view/form-add-task-component.js';
import { TasksBoardPresenter } from './presenter/tasks-board-presenter.js';
import { TaskModel } from './model/task-model.js';
import { tasks as mockTasks } from './mock/task.js';
import { render, RenderPosition } from './framework/render.js';

const initApp = () => {
  // 1. Получаем контейнеры
  const bodyContainer = document.querySelector('.board-app');
  const formContainer = document.querySelector('.add-task');
  const taskboardContainer = document.querySelector('.taskboard');

  // 2. Инициализируем модель
  const taskModel = new TaskModel(mockTasks);

  // 3. Рендерим компоненты
  render(new HeaderComponent(), bodyContainer, RenderPosition.AFTERBEGIN);
  render(new FormAddTaskComponent(), formContainer);

  // 4. Инициализируем презентер
  const boardPresenter = new TasksBoardPresenter(taskboardContainer, taskModel);
  boardPresenter.init();

  // 5. Настраиваем обработчик формы
  const form = formContainer.querySelector('.add-task__form');
  form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const input = form.querySelector('.add-task__input');
    const title = input.value.trim();
    
    if (title) {
      boardPresenter.handleAddTask(title);
      input.value = ''; // Очищаем поле
      input.focus(); // Возвращаем фокус
    }
  });
};

document.addEventListener('DOMContentLoaded', initApp);