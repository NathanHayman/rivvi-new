
```typescript
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export class RunStateService {
  private dynamoClient: DynamoDBClient;
  private s3Client: S3Client;

  constructor() {
    this.dynamoClient = new DynamoDBClient({});
    this.s3Client = new S3Client({});
  }

  async activateRun(runId: string, orgId: string) {
    // Check if org already has active campaign
    const activeRun = await this.getActiveRun(orgId);
    if (activeRun) {
      throw new Error('Organization already has an active campaign');
    }

    // Load processed data from S3
    const processedData = await this.getProcessedData(runId, orgId);

    // Create DynamoDB entries
    await this.createRunData(runId, orgId, processedData);

    // Update run status
    await this.updateRunStatus(runId, orgId, 'active');
  }

  private async getActiveRun(orgId: string) {
    const result = await this.dynamoClient.send(new GetItemCommand({
      TableName: process.env.ACTIVE_RUNS_TABLE,
      Key: {
        org_id: { S: orgId }
      }
    }));

    return result.Item;
  }

  private async getProcessedData(runId: string, orgId: string) {
    const result = await this.s3Client.send(new GetObjectCommand({
      Bucket: process.env.PROCESSED_DATA_BUCKET,
      Key: `${orgId}/${runId}/processed.json`
    }));

    const data = await result.Body?.transformToString();
    return JSON.parse(data || '[]');
  }

  private async createRunData(runId: string, orgId: string, data: any[]) {
    // Batch write to DynamoDB
    // Implementation depends on data structure
  }

  private async updateRunStatus(runId: string, orgId: string, status: string) {
    await this.dynamoClient.send(new UpdateItemCommand({
      TableName: process.env.ACTIVE_RUNS_TABLE,
      Key: {
        run_id: { S: runId },
        org_id: { S: orgId }
      },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': { S: status }
      }
    }));
  }
}
```
