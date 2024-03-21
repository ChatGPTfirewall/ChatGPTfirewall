import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

async function Request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axios(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `API call failed with status: ${error.response?.status}`,
        error.message
      );
      throw new Error(`API call failed: ${error.response?.status}`);
    } else {
      console.error('An unexpected error occurred', error);
      throw error;
    }
  }
}

export default Request;
