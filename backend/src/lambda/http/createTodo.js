// Assuming that you have default exports for these modules in their respective .mjs files
import middy from 'middy';
import cors from 'middy/middlewares/cors';
import getUserId from '../utils/getUserId.mjs';
import createTodo from '../../businessLogic/todos/CreateTodo.mjs';

export const handler = middy(async (event) => {
  const newTodo = JSON.parse(event.body);
  const userId = getUserId(event);

  try {
    const newItem = await createTodo(newTodo, userId);
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 201,
      body: JSON.stringify({
        item: newItem,
      }),
    };
  } catch (error) {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 500,
      body: JSON.stringify({ Error: error }),
    };
  }
});

handler.use(
  cors({
    credentials: true,
  })
);
