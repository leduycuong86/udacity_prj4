// AttachmentUtils.mjs
export class AttachmentUtils {
    constructor(bucketName = process.env.ATTACHMENT_S3_BUCKET) {
      this.bucketName = bucketName;
    }
  
    getAttachmentUrl(todoId) {
      return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;
    }
  }
  