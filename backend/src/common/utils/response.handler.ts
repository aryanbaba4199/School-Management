import { Response } from 'express';

/*------------- Response Interfaces -------------*/

export interface PaginationInfo {
  totalPages: number;
  totalCount: number;
  currentPage: number;
  limit: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  pagination?: PaginationInfo;
}

export interface ErrorResponse {
  success: false;
  message: string;
}

/*------------- Response Sender Helpers -------------*/

/**
 * Sends a successful API response
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  data: T,
  pagination?: PaginationInfo
): Response {
  const body: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (pagination) {
    body.pagination = pagination;
  }

  return res.status(statusCode).json(body);
}

/**
 * Sends an error API response
 */
export function sendError(
  res: Response,
  statusCode: number,
  message: string
): Response {
  const body: ErrorResponse = {
    success: false,
    message,
  };

  return res.status(statusCode).json(body);
}
