// handler.mjs
import middy from 'middy'; // Adjust this line if middy uses named exports
import { cors, httpErrorHandler } from 'middy/middlewares'; // Adjust if middy middlewares are not named exports

import { updateTodo } from '../../businessLogic/todos.mjs'; // Ensure todos.mjs exports updateTodo
import { getUserId } from '../utils.mjs'; // Ensure utils.mjs exports getUserId

export const handler = middy(async (event) => {
  try {
    const todoId = event.pathParameters.todoId;
    const updatedTodo = JSON.parse(event.body);
    const userId = getUserId(event);
    await updateTodo(userId, todoId, updatedTodo);
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      statusCode: 204,
      body: JSON.stringify({ item: updatedTodo }),
    };
  } catch (error) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      statusCode: 500,
      body: JSON.stringify({ error: String(error) }), // Convert error to string to ensure stringify works
    };
  }
});

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);
