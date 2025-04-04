import HeaderComponent from './view/header-component.js';
import FormAddTaskComponent from './view/form-add-task-component.js';
import TaskboardComponent from './view/taskboard-component.js';
import TaskListComponent from './view/task-list-component.js';
import TaskComponent from './view/task-component.js';
import { render, RenderPosition } from './render.js';

// 1. Отрисовка основных компонентов (по одному экземпляру)
const bodyContainer = document.querySelector('.board-app');
render(new HeaderComponent(), bodyContainer, RenderPosition.BEFOREBEGIN);

const formContainer = document.querySelector('.add-task');
render(new FormAddTaskComponent(), formContainer);

const taskboardContainer = document.querySelector('.taskboard');
render(new TaskboardComponent(), taskboardContainer);

// 2. Отрисовка 4 списков задач
const listsConfig = [
  { id: 'backlog', title: 'Бэклог', tasks: ['Задача 1', 'Задача 2', 'Задача 3'] },
  { id: 'in-progress', title: 'В процессе', tasks: ['Задача A', 'Задача B'] },
  { id: 'done', title: 'Готово', tasks: ['Задача X', 'Задача Y'] },
  { id: 'trash', title: 'Корзина', tasks: ['Удаленная 1', 'Удаленная 2'], hasClearButton: true }
];

const taskboardInner = document.querySelector('.taskboard__inner');

listsConfig.forEach(list => {
  // 3. Создаем и рендерим каждый список
  const listComponent = new TaskListComponent(list);
  render(listComponent, taskboardInner);
  
  // 4. Отрисовываем задачи внутри списка
  const listElement = document.getElementById(list.id);
  const tasksContainer = listElement.querySelector('.task-list__items');
  
  list.tasks.forEach(taskText => {
    render(new TaskComponent(taskText), tasksContainer);
  });
  
  // 5. Добавляем кнопку очистки если нужно
  if (list.hasClearButton) {
    const clearButton = document.createElement('button');
    clearButton.className = 'clear-btn';
    clearButton.textContent = 'Очистить';
    clearButton.addEventListener('click', () => {
      tasksContainer.innerHTML = '';
    });
    listElement.appendChild(clearButton);
  }
});