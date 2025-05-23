export const errors = {
  BadRequest: (message: string) => new Response(message, { status: 400 }),
  Unauthorized: (message: string) => new Response(message, { status: 401 }),
  Forbidden: (message: string) => new Response(message, { status: 403 }),
  NotFound: (message: string) => new Response(message, { status: 404 }),
  InternalServerError: (message: string) => new Response(message, { status: 500 }),
};
