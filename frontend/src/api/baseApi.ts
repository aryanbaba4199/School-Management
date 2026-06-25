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
      if (key === 'role' && typeof obj[key] === 'string') {
        newObj['role'] = { name: obj[key], access: [] };
      } else if (key === 'id') {
        newObj['_id'] = mapResponseKeys(obj[key]);
      } else {
        newObj[snakeToCamel(key)] = mapResponseKeys(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

const camelToSnake = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const mapRequestKeys = (obj: any): any => {
  if (
    typeof window !== 'undefined' &&
    (obj instanceof FormData || obj instanceof URLSearchParams || obj instanceof Blob || obj instanceof File)
  ) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(mapRequestKeys);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      let val = obj[key];
      const snakeKey = camelToSnake(key);
      const isId = typeof val === 'string' && /^([0-9a-fA-F]{24}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/i.test(val);

      if (val === '') {
        val = null;
      }

      if (key === '_id') {
        newObj['id'] = mapRequestKeys(val);
      } else if (isId && !snakeKey.endsWith('_id') && snakeKey !== 'id') {
        newObj[`${snakeKey}_id`] = mapRequestKeys(val);
      } else {
        newObj[snakeKey] = mapRequestKeys(val);
      }
    }
    return newObj;
  }
  return obj;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    let mappedArgs = args;
    if (typeof args === 'object' && args !== null && 'body' in args && args.body) {
      mappedArgs = {
        ...args,
        body: mapRequestKeys(args.body)
      };
    }

    const processUrlParams = (url: string) => {
      if (!url.includes('?')) return url;
      const [path, queryString] = url.split('?');
      const params = new URLSearchParams(queryString);
      if (params.has('page')) {
        const page = parseInt(params.get('page') || '1');
        const limit = parseInt(params.get('limit') || '10');
        params.set('skip', ((page - 1) * limit).toString());
        params.delete('page');
      }
      return `${path}?${params.toString()}`;
    };

    if (typeof mappedArgs === 'string') {
      mappedArgs = processUrlParams(mappedArgs);
    } else if (typeof mappedArgs === 'object' && mappedArgs !== null && 'url' in mappedArgs) {
      mappedArgs = { ...mappedArgs, url: processUrlParams(mappedArgs.url) };
    }

    const result = await rawBaseQuery(mappedArgs, api, extraOptions);
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
          if ('data' in mappedData && Array.isArray(mappedData.data)) {
            result.data = { success: true, ...mappedData };
          } else {
            result.data = { success: true, data: mappedData };
          }
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
