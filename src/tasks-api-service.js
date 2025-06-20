import ApiService from './framework/api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE'
};

export default class TasksApiService extends ApiService {
  get tasks() {
    return this._load({ url: 'tasks' })
      .then(response => {
        const parsedResponse = ApiService.parseResponse(response);
        console.log('API Response:', parsedResponse);
        return parsedResponse;
      });
  }

  async addTask(task) {
    const response = await this._load({
      url: 'tasks',
      method: Method.POST,
      body: JSON.stringify(task),
      headers: new Headers({'Content-Type': 'application/json'})
    });
    return ApiService.parseResponse(response);
  }

  async updateTask(task) {
    const response = await this._load({
      url: `tasks/${task.id}`,
      method: Method.PUT,
      body: JSON.stringify(task),
      headers: new Headers({'Content-Type': 'application/json'})
    });
    return ApiService.parseResponse(response);
  }

  async deleteTask(taskId) {
    await this._load({
      url: `tasks/${taskId}`,
      method: Method.DELETE
    });
  }
}