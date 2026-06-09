import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.handler';

/*------------- Request Validation Middleware -------------*/

interface ParsedRequest {
  body?: unknown;
  query?: ParsedQs;
  params?: ParamsDictionary;
}

/**
 * Validates request data against a Zod schema.
 * Assumes the schema has keys for 'body', 'query', or 'params'.
 */
export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as ParsedRequest;

      // Update request properties with type-safe parsed values
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Collect all error messages into a single string
        const errorDetails = error.issues
          .map((err) => {
            const field = err.path
              .filter((p): p is string => typeof p === 'string' && p !== 'body' && p !== 'query' && p !== 'params')
              .join('.');
            return `${field || 'request'}: ${err.message}`;
          })
          .join(', ');

        sendError(res, 400, `Validation Error: ${errorDetails}`);
        return;
      }

      next(error);
    }
  };
}
