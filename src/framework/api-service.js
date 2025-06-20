export default class ApiService {
  constructor(endPoint) {
    this._endPoint = endPoint;
  }

  async _load({
    url,
    method = 'GET',
    body = null,
    headers = new Headers(),
  }) {
    try {
      console.log(`Making ${method} request to ${this._endPoint}/${url}`);
      
      if (body) {
        headers.append('Content-Type', 'application/json');
      }

      const response = await fetch(
        `${this._endPoint}/${url}`,
        { method, body, headers },
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (err) {
      console.error('API request failed:', err);
      throw err;
    }
  }
  
  static parseResponse(response) {
    return response;
  }
  
  static checkStatus(response) {
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  }
  
  static catchError(err) {
    console.error('API Error:', err);
    throw err;
  }
}