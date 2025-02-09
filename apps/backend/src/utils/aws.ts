import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Configure AWS SDK with environment variables
const awsConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};

// Initialize S3 client
export const s3Client = new S3Client(awsConfig);

// Initialize DynamoDB client with converter
const ddbClient = new DynamoDBClient(awsConfig);
export const dynamoDb = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
});

export let eventBridgeClient: EventBridgeClient;
export let sqsClient: SQSClient;

export const initializeAWS = () => {
  eventBridgeClient = new EventBridgeClient(awsConfig);
  sqsClient = new SQSClient(awsConfig);
};

// Initialize S3 client
export const s3 = new S3Client({});
