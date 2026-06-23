import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  getToken?: () => Promise<string | null> | string | null;
}

export const createApiClient = (config: ApiClientConfig): AxiosInstance => {
  const client = axios.create({
    baseURL: config.baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    async (axiosConfig: InternalAxiosRequestConfig) => {
      if (config.getToken) {
        const token = await config.getToken();
        if (token) {
          axiosConfig.headers.Authorization = `Bearer ${token}`;
        }
      }
      return axiosConfig;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return client;
};
