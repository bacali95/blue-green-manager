import type { RpcSchema } from '../shared';

export async function createRpcHandler<T extends RpcSchema>(request: Request, operations: T) {
  if (request.method !== 'POST') {
    throw new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { entity, operation, params } = await request.json();

    return await (operations as any)[entity][operation](params);
  } catch (error: any) {
    throw handleError(error);
  }
}

function handleError(error: any): Response {
  if (error instanceof Response) {
    return error;
  }

  if (error.name === 'PrismaClientValidationError') {
    return new Response(error.message, { status: 400 });
  }

  if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2004') {
      const statusCode =
        zenErrorToHttpStatus[error.meta?.reason ?? 'default'] || zenErrorToHttpStatus['default'];

      return new Response(error.message, { status: statusCode });
    }

    const statusCode = prismaErrorToHttpStatus[error.code] || prismaErrorToHttpStatus['default'];

    return new Response(error.message, { status: statusCode });
  }

  return new Response(error.message, { status: 500 });
}

const prismaErrorToHttpStatus: Record<string, number> = {
  // Unique constraint violations
  P2002: 409, // Conflict - When a unique constraint is violated

  // Record not found errors
  P2025: 404, // Not Found - When a record is not found

  // Foreign key constraint violations
  P2003: 409, // Conflict - When a foreign key constraint is violated

  // Required field violations
  P2011: 400, // Bad Request - When a required field is null

  // Data validation errors
  P2006: 400, // Bad Request - When data validation fails

  // Database connection errors
  P1001: 503, // Service Unavailable - Can't reach database server
  P1002: 503, // Service Unavailable - Database connection timed out

  // Authentication errors
  P1010: 401, // Unauthorized - User denied access to database

  // Database does not exist
  P1003: 500, // Internal Server Error - Database does not exist

  // Default for unknown errors
  default: 500, // Internal Server Error
};

const zenErrorToHttpStatus: Record<string, number> = {
  // Access policy violations
  ACCESS_POLICY_VIOLATION: 403, // Forbidden - When a user attempts to access a resource they don't have permission to

  // Result not readable
  RESULT_NOT_READABLE: 400, // Bad Request - When the result is not readable

  // Data validation violations
  DATA_VALIDATION_VIOLATION: 400, // Bad Request - When data validation fails

  // Default for unknown errors
  default: 500, // Internal Server Error
};
