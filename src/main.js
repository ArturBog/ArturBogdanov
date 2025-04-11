import { HeaderComponent } from './view/header-component.js';
import { FormAddTaskComponent } from './view/form-add-task-component.js';
import { TasksBoardPresenter } from './presenter/tasks-board-presenter.js';
import { render } from './framework/render.js';

const bodyContainer = document.querySelector('.board-app');
const formContainer = document.querySelector('.add-task');
const taskboardContainer = document.querySelector('.taskboard');

// Отрисовка компонентов
render(new HeaderComponent(), bodyContainer, 'afterbegin');
render(new FormAddTaskComponent(), formContainer);

// Инициализация презентера
const boardPresenter = new TasksBoardPresenter(taskboardContainer);
boardPresenter.init();