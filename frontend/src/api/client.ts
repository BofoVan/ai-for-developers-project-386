import createClient from 'openapi-fetch';
import type { paths } from './generated/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const client = createClient<paths>({
  baseUrl: API_BASE_URL,
});
