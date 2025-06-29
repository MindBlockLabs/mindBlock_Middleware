import { AxiosError } from 'axios';

interface FormattedError {
  statusCode: number;
  message: string;
  details: string[] | null;
  timestamp: string;
}

export function formatError(error: any): FormattedError {
  const timestamp = new Date().toISOString();

  if (error.isAxiosError) {
    const axiosError = error as AxiosError<{ errors?: string[] }>;
    return {
      statusCode: axiosError.response?.status || 500,
      message: axiosError.message,
      details: axiosError.response?.data?.errors || null,
      timestamp,
    };
  }

  if (error.name === 'ZodError') {
    return {
      statusCode: 400,
      message: 'Validation failed',
      details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`),
      timestamp,
    };
  }


  return {
    statusCode: error.statusCode || 500,
    message: error.message || 'Something went wrong',
    details: null,
    timestamp,
  };
}