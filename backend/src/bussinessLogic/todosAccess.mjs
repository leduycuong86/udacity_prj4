// TodosAccess.mjs
import AWS from "aws-sdk";
import AWSXRay from "aws-xray-sdk";
import createLogger from "../utils/logger.mjs";
import createDynamoDBClient from "../utils/dynamoDBClient.mjs"; // assuming you have this function in a separate file

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger("TodoAccess");
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const s3BucketName = process.env.ATTACHMENT_S3_BUCKET;

export class TodosAccess {
  constructor(
    docClient = createDynamoDBClient(),
    todosTable = process.env.TODOS_TABLE,
    todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    S3 = new XAWS.S3({ signatureVersion: "v4" }),
    bucketName = s3BucketName
  ) {
    this.docClient = docClient;
    this.todosTable = todosTable;
    this.todosIndex = todosIndex;
    this.S3 = S3;
    this.bucketName = bucketName;
  }

  async getAll(userId) {
    logger.info("Call function getall");
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();
    return result.Items;
  }

  async create(item) {
    logger.info("Call function create");
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: item,
      })
      .promise();
    return item;
  }

  async update(userId, todoId, todoUpdate) {
    logger.info(`Updating todo item ${todoId} in ${this.todosTable}`);
    try {
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: {
            userId,
            todoId,
          },
          UpdateExpression:
            "set #name = :name, #dueDate = :dueDate, #done = :done",
          ExpressionAttributeNames: {
            "#name": "name",
            "#dueDate": "dueDate",
            "#done": "done",
          },
          ExpressionAttributeValues: {
            ":name": todoUpdate.name,
            ":dueDate": todoUpdate.dueDate,
            ":done": todoUpdate.done,
          },
          ReturnValues: "UPDATED_NEW",
        })
        .promise();
    } catch (error) {
      logger.error("Error updating Todo.", {
        error: error,
        data: {
          todoId,
          userId,
          todoUpdate,
        },
      });
      throw new Error(error);
    }
    return todoUpdate;
  }

  async delete(userId, todoId) {
    logger.info(`Deleting todo item ${todoId} from ${this.todosTable}`);
    try {
      await this.docClient
        .delete({
          TableName: this.todosTable,
          Key: {
            userId,
            todoId,
          },
        })
        .promise();
      return "success";
    } catch (e) {
      logger.info("Error deleting todo item", { error: e });
      return "Error";
    }
  }

  async getUploadUrl(todoId, userId) {
    const uploadUrl = this.S3.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: parseInt(urlExpiration, 10),
    });
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: "set attachmentUrl = :URL",
        ExpressionAttributeValues: {
          ":URL": uploadUrl.split("?")[0],
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
    return uploadUrl;
  }
}
