import type { NextApiRequest, NextApiResponse } from 'next';
import { formatError } from '../lib/formatError';

export function apiHandler(fn: (req: NextApiRequest, res: NextApiResponse) => Promise<any>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await fn(req, res);
    } catch (error) {
      const formatted = formatError(error);
      res.status(formatted.statusCode).json(formatted);
    }
  };
}