import axios from 'axios'

export class Http {
  client: any;

  constructor(baseURL: string = '', options: any = {}) {
    this.client = axios.create({
      baseURL,
      withCredentials: false,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', },
      ...options
    })
  }

  async get(url: string, options: any) {
    const response = await this.client.get(url, options)
    return response.data
  }

  async post(url: string, body: any, options: any = {}) {
    const response = await this.client.post(url, body, options)
    return response.data
  }
}

export default new Http()
