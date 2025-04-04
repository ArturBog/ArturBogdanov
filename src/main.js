import HeaderComponent from './view/header-component.js';
import FormAddTaskComponent from './view/form-add-task-component.js';
import TasksBoardPresenter from './presenter/tasks-board-presenter.js';
import { render, RenderPosition } from './render.js';

const bodyContainer = document.querySelector('.board-app');
const formContainer = document.querySelector('.add-task');
const taskboardContainer = document.querySelector('.taskboard');

// 1. Сначала рендерим хедер (добавляем в самое начало body)
render(new HeaderComponent(), bodyContainer, RenderPosition.AFTERBEGIN);

// 2. Затем форму добавления задач
render(new FormAddTaskComponent(), formContainer);

// 3. Инициализируем презентер
const tasksBoardPresenter = new TasksBoardPresenter(taskboardContainer);
tasksBoardPresenter.init();