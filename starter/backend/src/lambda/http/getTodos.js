// Assuming that middy and cors are available as named exports from the 'middy' package.
import middy from 'middy'; // Make sure middy is the default export
import { cors } from 'middy/middlewares'; // Make sure cors is a named export
import { getTodosForUser } from '../../businessLogic/todos.mjs'; // Adjust the path if necessary and ensure todos.mjs is exporting getTodosForUser
import { getUserId } from '../utils.mjs'; // Adjust the path if necessary and ensure utils.mjs is exporting getUserId

export const handler = middy(async (event) => {
  try {
    const userId = getUserId(event);
    const todos = await getTodosForUser(userId);
    return {
      statusCode: 200,
      body: JSON.stringify({ items: todos }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(error) }), // Convert error to string to ensure stringify works
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  }
});

handler.use(
  cors({
    credentials: true,
  })
);
