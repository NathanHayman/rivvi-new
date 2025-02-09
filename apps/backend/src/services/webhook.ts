
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

interface WebhookPayload {
  type: string;
  direction: 'inbound' | 'outbound';
  metadata: {
    run_id: string;
    row_id: string;
    org_id: string;
    campaign_id: string;
  };
  call_data: {
    transcript: string;
    sentiment: string;
    duration: number;
    status: string;
  };
}

export class WebhookService {
  private s3Client: S3Client;
  private dynamoClient: DynamoDBClient;
  private sqsClient: SQSClient;

  constructor() {
    this.s3Client = new S3Client({});
    this.dynamoClient = new DynamoDBClient({});
    this.sqsClient = new SQSClient({});
  }

  async handleWebhook(payload: WebhookPayload) {
    // Only process call_analyzed events
    if (payload.type !== 'call_analyzed') {
      return;
    }

    // Store raw webhook in S3
    await this.storeRawWebhook(payload);

    // Update DynamoDB if outbound call
    if (payload.direction === 'outbound') {
      await this.updateRunData(payload);
    }

    // Queue for batch processing
    await this.queueForProcessing(payload);
  }

  private async storeRawWebhook(payload: WebhookPayload) {
    const key = `${payload.metadata.org_id}/${payload.metadata.run_id}/${payload.metadata.row_id}/webhook.json`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: process.env.CALL_LOGS_BUCKET,
      Key: key,
      Body: JSON.stringify(payload),
      ContentType: 'application/json'
    }));
  }

  private async updateRunData(payload: WebhookPayload) {
    await this.dynamoClient.send(new UpdateItemCommand({
      TableName: process.env.RUN_DATA_TABLE,
      Key: {
        run_id: { S: payload.metadata.run_id },
        row_id: { S: payload.metadata.row_id }
      },
      UpdateExpression: 'SET call_status = :status, call_data = :data',
      ExpressionAttributeValues: {
        ':status': { S: payload.call_data.status },
        ':data': { M: {
          transcript: { S: payload.call_data.transcript },
          sentiment: { S: payload.call_data.sentiment },
          duration: { N: payload.call_data.duration.toString() }
        }}
      }
    }));
  }

  private async queueForProcessing(payload: WebhookPayload) {
    await this.sqsClient.send(new SendMessageCommand({
      QueueUrl: process.env.BATCH_QUEUE_URL,
      MessageBody: JSON.stringify({
        type: payload.direction === 'inbound' ? 'inbound_call' : 'outbound_call',
        webhook: payload,
        timestamp: Date.now()
      })
    }));
  }
}
```
