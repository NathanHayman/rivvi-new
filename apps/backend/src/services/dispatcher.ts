
```typescript
import { DynamoDBClient, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { RetellClient } from './retell'; // You'll need to implement this

export class DispatcherService {
  private dynamoClient: DynamoDBClient;
  private retellClient: RetellClient;
  private MAX_CONCURRENT_CALLS = 20;

  constructor() {
    this.dynamoClient = new DynamoDBClient({});
    this.retellClient = new RetellClient();
  }

  async dispatchCalls(runId: string, orgId: string) {
    // Get current active calls count
    const activeCalls = await this.getActiveCalls(orgId);
    
    // Calculate how many new calls we can make
    const availableSlots = this.MAX_CONCURRENT_CALLS - activeCalls;
    if (availableSlots <= 0) return;

    // Get next batch of calls to make
    const callBatch = await this.getNextBatch(runId, availableSlots);

    // Dispatch calls
    for (const call of callBatch) {
      await this.dispatchCall(call, runId, orgId);
    }
  }

  private async getActiveCalls(orgId: string) {
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.ACTIVE_CALLS_TABLE,
      KeyConditionExpression: 'org_id = :orgId',
      ExpressionAttributeValues: {
        ':orgId': { S: orgId }
      }
    }));

    return result.Items?.length || 0;
  }

  private async getNextBatch(runId: string, batchSize: number) {
    // Query DynamoDB for next batch of calls to make
    // Implementation depends on data structure
  }

  private async dispatchCall(call: any, runId: string, orgId: string) {
    const metadata = {
      run_id: runId,
      row_id: call.row_id,
      org_id: orgId,
      campaign_id: call.campaign_id
    };

    await this.retellClient.makeCall({
      from_number: call.from_number,
      to_number: call.to_number,
      override_agent_id: call.agent_id,
      retell_llm_dynamic_variables: {
        first_name: call.first_name,
        last_name: call.last_name,
        dob: call.dob,
        is_minor: this.calculateIsMinor(call.dob),
        phone: call.phone,
        ...call.campaign_variables
      },
      metadata
    });
  }

  private calculateIsMinor(dob: string): string {
    const birthDate = new Date(dob);
    const age = Math.floor((Date.now() - birthDate.getTime()) / 31557600000);
    return (age < 18).toString().toUpperCase();
  }
}
```
