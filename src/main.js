// Дожидаемся полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://682781386b7628c529109aba.mockapi.io/tasks';
  const taskForm = document.querySelector('.add-task__form');
  const taskInput = document.querySelector('.add-task__input');
  const taskboard = document.querySelector('.taskboard__inner');

  // Create columns
  const columns = ['backlog', 'in-progress', 'done', 'trash'];
  columns.forEach(status => {
    const column = document.createElement('div');
    column.className = `taskboard__column taskboard__column--${status}`;
    column.innerHTML = `
      <h2 class="taskboard__title">${status.replace('-', ' ').toUpperCase()}</h2>
      <div class="taskboard__tasks" data-status="${status}"></div>
      ${status === 'trash' ? '<button class="clear-trash-btn" type="button">Очистить корзину</button>' : ''}
    `;
    taskboard.appendChild(column);
  });

  // Render tasks
  async function renderTasks() {
    const res = await fetch(API_URL);
    const tasks = await res.json();
    console.log('Текущие задачи:', tasks);
    document.querySelectorAll('.taskboard__tasks').forEach(column => {
      column.innerHTML = '';
      const status = column.dataset.status;
      const columnTasks = tasks.filter(task => task.status === status);
      if (columnTasks.length === 0) {
        column.innerHTML = '<div class="no-tasks">Нет задач</div>';
        return;
      }
      columnTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.draggable = true;
        taskElement.dataset.id = task.id;
        const taskContent = document.createElement('div');
        taskContent.className = 'task__content';
        const taskTitle = document.createElement('h3');
        taskTitle.className = 'task__title';
        taskTitle.textContent = task.title;
        const taskDescription = document.createElement('p');
        taskDescription.className = 'task__description';
        taskDescription.textContent = task.description || '';
        const deleteButton = document.createElement('button');
        deleteButton.className = 'task__delete';
        deleteButton.textContent = '×';
        taskContent.appendChild(taskTitle);
        taskContent.appendChild(taskDescription);
        taskElement.appendChild(taskContent);
        taskElement.appendChild(deleteButton);
        // Drag and drop events
        taskElement.addEventListener('dragstart', function(e) {
          handleDragStart.call(this, e);
        });
        taskElement.addEventListener('dragend', function(e) {
          handleDragEnd.call(this, e);
        });
        column.appendChild(taskElement);
      });
    });
    attachColumnDnDHandlers();
  }

  // Add new task
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;
    const task = {
      title,
      description: '',
      status: 'backlog'
    };
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    await renderTasks();
    taskInput.value = '';
  });

  // Delete task
  taskboard.addEventListener('click', async (e) => {
    if (e.target.classList.contains('task__delete')) {
      const taskElement = e.target.closest('.task');
      const taskId = taskElement.dataset.id;
      // Получаем задачу
      const res = await fetch(`${API_URL}/${taskId}`);
      const task = await res.json();
      if (task.status !== 'trash') {
        // Перемещаем в корзину
        await fetch(`${API_URL}/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'trash' })
        });
      } else {
        // Удаляем навсегда
        await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
      }
      await renderTasks();
    }
    if (e.target.classList.contains('clear-trash-btn')) {
      // Получаем все задачи
      const res = await fetch(API_URL);
      const tasks = await res.json();
      const trashTasks = tasks.filter(task => task.status === 'trash');
      // Удаляем все задачи из корзины
      await Promise.all(trashTasks.map(task => fetch(`${API_URL}/${task.id}`, { method: 'DELETE' })));
      await renderTasks();
    }
  });

  // Drag and drop handlers
  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', this.dataset.id);
    this.classList.add('dragging');
  }
  function handleDragEnd(e) {
    this.classList.remove('dragging');
  }
  function attachColumnDnDHandlers() {
    document.querySelectorAll('.taskboard__tasks').forEach(column => {
      column.ondragover = (e) => {
        e.preventDefault();
        column.classList.add('drag-over');
      };
      column.ondragleave = () => {
        column.classList.remove('drag-over');
      };
      column.ondrop = async (e) => {
        e.preventDefault();
        column.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = column.dataset.status;
        // Получаем задачу
        const res = await fetch(`${API_URL}/${taskId}`);
        const task = await res.json();
        if (task) {
          await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          await renderTasks();
        }
      };
    });
  }

  // Initial render
  renderTasks();
});