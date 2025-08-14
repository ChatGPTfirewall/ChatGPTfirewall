import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpError } from '../utils/HttpError';

async function Request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    // Accessing token for subsequent requests
    const token = localStorage.getItem('userToken');
    if (token == null) {
      console.group('get token');
    } else {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    const response: AxiosResponse<T> = await axios(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `API call failed with status: ${error.response?.status}`,
        error.message
      );
      throw new HttpError(`API call failed: ${error.response?.status}`, error.response?.status);
    } else {
      console.error('An unexpected error occurred', error);
      throw error;
    }
  }
}

export default Request;
