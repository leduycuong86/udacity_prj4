// Assuming that DeleteTodo and getUserId are default exports from their respective modules
import middy from 'middy'; // Assuming middy has a default export
import { cors, httpErrorHandler } from 'middy/middlewares'; // Assuming middy middlewares are named exports

import DeleteTodo from '../../businessLogic/todos/DeleteTodo.mjs';
import getUserId from '../utils/getUserId.mjs';

export const handler = middy(async (event) => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  try {
    await DeleteTodo(userId, todoId);
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      statusCode: 204,
      body: "",
    };
  } catch (err) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      statusCode: 500,
      body: JSON.stringify({ Error: err }),
    };
  }
});

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);
