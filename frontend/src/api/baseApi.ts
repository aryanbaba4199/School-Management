import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TAG_TYPES } from './tagTypes';

import { API_BASE_URL } from '@constants';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const snakeToCamel = (str: string) => str.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));

const mapResponseKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(mapResponseKeys);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key === 'id') {
        newObj['_id'] = mapResponseKeys(obj[key]);
      } else {
        newObj[snakeToCamel(key)] = mapResponseKeys(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/';
    }

    // FastAPI Integration: Wrap responses to match Legacy Express format
    if (result.data) {
      const mappedData = mapResponseKeys(result.data);
      if (typeof mappedData === 'object' && !('success' in mappedData) && !Array.isArray(mappedData)) {
        if ('accessToken' in mappedData) {
          result.data = {
            success: true,
            message: 'Success',
            data: {
              token: mappedData.accessToken,
              user: mappedData.user
            }
          };
        } else {
          result.data = { success: true, data: mappedData };
        }
      } else if (Array.isArray(mappedData)) {
        result.data = {
          success: true,
          data: mappedData,
          pagination: { totalPages: 1, totalCount: mappedData.length, currentPage: 1, limit: mappedData.length }
        };
      }
    }

    return result;
  },
  tagTypes: TAG_TYPES as unknown as string[],
  endpoints: () => ({}),
});
