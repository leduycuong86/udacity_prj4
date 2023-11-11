// handler.mjs
import middy from 'middy'; // Adjust this line if middy exports named exports
import { cors, httpErrorHandler } from 'middy/middlewares'; // Adjust if middy middlewares are not named exports

import { createAttachmentPresignedUrl } from '../../businessLogic/todos.mjs'; // Ensure todos.mjs exports createAttachmentPresignedUrl
import { getUserId } from '../utils.mjs'; // Ensure utils.mjs exports getUserId

export const handler = middy(async (event) => {
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId;
  const url = await createAttachmentPresignedUrl(userId, todoId);
  return {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    statusCode: 201,
    body: JSON.stringify({ uploadUrl: url }),
  };
});

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);
