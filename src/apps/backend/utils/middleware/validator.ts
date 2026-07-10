import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodObject } from "zod";

interface ValidationSchemas {
  body?: ZodObject;
  query?: ZodObject;
  params?: ZodObject;
}

export const validate = (schemas: ValidationSchemas) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(
          req.params,
        )) as typeof req.params;
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(
          req.query,
        )) as typeof req.query;
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format the errors nicely for the client
        res.status(400).json({
          status: "fail",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }
      next(error); // Forward unexpected errors to Express global error handler
    }
  };
};
