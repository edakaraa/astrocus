import type { Response } from "express";

export type ApiErrorResponse = {
  error: {
    message: string;
  };
};

export const sendError = (response: Response, status: number, message: string) => {
  return response.status(status).json({ error: { message } } satisfies ApiErrorResponse);
};

