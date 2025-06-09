export const Status = {
  BACKLOG: 'backlog',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  TRASH: 'trash'
};

export const StatusTitle = {
  [Status.BACKLOG]: 'Backlog',
  [Status.IN_PROGRESS]: 'In Progress',
  [Status.DONE]: 'Done',
  [Status.TRASH]: 'Trash'
};

export const UpdateType = {
  INIT: 'INIT',
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  ERROR: 'ERROR'
};

export const UserAction = {
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK'
};