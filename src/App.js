import React, { useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      createdAt: new Date().toISOString()
    };

    setTasks(prevTasks => [...prevTasks, task]);
    setNewTask({ title: '', description: '' });
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    updateTaskStatus(taskId, newStatus);
  };

  const statuses = ['todo', 'in-progress', 'done'];

  return (
    <div className="app">
      <h1>Task Manager</h1>
      
      <form onSubmit={addTask} className="add-task-form">
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
        />
        <textarea
          placeholder="Task description"
          value={newTask.description}
          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
        />
        <button type="submit">Add Task</button>
      </form>

      <div className="board">
        {statuses.map(status => (
          <div
            key={status}
            className="column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <h2>{status.replace('-', ' ').toUpperCase()}</h2>
            <div className="tasks">
              {tasks
                .filter(task => task.status === status)
                .map(task => (
                  <div
                    key={task.id}
                    className="task"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App; 