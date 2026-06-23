import { MifalApiClient } from '@mifal-israel/api-client';
import dotenv from 'dotenv';

dotenv.config();

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

export const apiService = new MifalApiClient({
  baseURL: backendUrl,
  getToken: () => null, // Bot might not need a user token for now, or use a bot secret
});
