import { TodosAccess } from "./todosAcess";
import { AttachmentUtils } from "./attachmentUtils";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { createLogger } from "../utils/logger";
import * as uuid from "uuid";
// import * as createError from "http-errors";

const logger = createLogger("TodosAccess");
const attatchmentUtils = new AttachmentUtils();
const todosAccess = new TodosAccess();

export async function CreateTodo(
  newItem: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info("Call function create todos");
  const todoId = uuid.v4();
  const createdAt = new Date().toISOString();
  const s3AttachUrl = attatchmentUtils.getAttachmentUrl(userId);
  const _newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: s3AttachUrl,
    ...newItem,
  };
  return await todosAccess.create(_newItem);
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info("Call function getall todos");
  return await todosAccess.getAll(userId);
}

export async function UpdateTodo(
  userId: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
): Promise<TodoItem> {
  logger.info("Call function update todos");
  return await todosAccess.update(userId, todoId, updatedTodo);
}

export async function DeleteTodo(
  userId: string,
  todoId: string
): Promise<String> {
  logger.info("Call function delete todos");
  return await todosAccess.delete(userId, todoId);
}

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
): Promise<String> {
  logger.info("Call function createAttachmentPresignedUrl todos by" + userId);
  const uploadUrl = todosAccess.getUploadUrl(todoId, userId);
  return uploadUrl;
}
