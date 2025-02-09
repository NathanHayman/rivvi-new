import { dynamoDb } from "@/utils/aws";
import { logger } from "@/utils/logger";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const eventBridge = new EventBridgeClient({});

export enum RunStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  READY = "READY",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface RunState {
  run_id: string;
  status: RunStatus;
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  activeCalls: number; // Number of currently active calls
  lastUpdated: string;
}

export class RunStateManager {
  private readonly TABLE_NAME = process.env.DYNAMODB_RUN_STATE_TABLE!;
  private readonly EVENT_BUS = process.env.EVENT_BUS_NAME!;

  async initializeState(
    runId: string,
    campaignId: string,
    orgId: string
  ): Promise<RunState> {
    const state: RunState = {
      run_id: runId,
      status: RunStatus.PENDING,
      totalCalls: 0,
      completedCalls: 0,
      failedCalls: 0,
      activeCalls: 0,
      lastUpdated: new Date().toISOString(),
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: this.TABLE_NAME,
        Item: state,
      })
    );

    await this.emitStateChange(state);
    return state;
  }

  async getState(runId: string): Promise<RunState | null> {
    try {
      const response = await dynamoDb.send(
        new GetCommand({
          TableName: this.TABLE_NAME,
          Key: { run_id: runId },
        })
      );

      return (response.Item as RunState) || null;
    } catch (error) {
      logger.error({ error, runId }, "Error getting run state");
      throw error;
    }
  }

  async updateState(runId: string, updates: Partial<RunState>): Promise<void> {
    try {
      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(updates).forEach(([key, value]) => {
        const attributeName = `#${key}`;
        const attributeValue = `:${key}`;
        updateExpressions.push(`${attributeName} = ${attributeValue}`);
        expressionAttributeNames[attributeName] = key;
        expressionAttributeValues[attributeValue] = value;
      });

      // Always update lastUpdated
      updateExpressions.push("#lastUpdated = :lastUpdated");
      expressionAttributeNames["#lastUpdated"] = "lastUpdated";
      expressionAttributeValues[":lastUpdated"] = new Date().toISOString();

      await dynamoDb.send(
        new UpdateCommand({
          TableName: this.TABLE_NAME,
          Key: { run_id: runId },
          UpdateExpression: `SET ${updateExpressions.join(", ")}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        })
      );
    } catch (error) {
      logger.error({ error, runId, updates }, "Error updating run state");
      throw error;
    }
  }

  async getRunsByOrg(orgId: string, status?: RunStatus): Promise<RunState[]> {
    try {
      const params: any = {
        TableName: this.TABLE_NAME,
        IndexName: "orgId-lastUpdated-index",
        KeyConditionExpression: "#orgId = :orgId",
        ExpressionAttributeNames: {
          "#orgId": "orgId",
        },
        ExpressionAttributeValues: {
          ":orgId": orgId,
        },
      };

      if (status) {
        params.FilterExpression = "#status = :status";
        params.ExpressionAttributeNames["#status"] = "status";
        params.ExpressionAttributeValues[":status"] = status;
      }

      const response = await dynamoDb.send(new QueryCommand(params));
      return response.Items as RunState[];
    } catch (error) {
      logger.error({ error, orgId, status }, "Error getting runs by org");
      throw error;
    }
  }

  async getRunsByCampaign(campaignId: string): Promise<RunState[]> {
    try {
      const response = await dynamoDb.send(
        new QueryCommand({
          TableName: this.TABLE_NAME,
          IndexName: "campaignId-lastUpdated-index",
          KeyConditionExpression: "#campaignId = :campaignId",
          ExpressionAttributeNames: {
            "#campaignId": "campaignId",
          },
          ExpressionAttributeValues: {
            ":campaignId": campaignId,
          },
        })
      );
      return response.Items as RunState[];
    } catch (error) {
      logger.error({ error, campaignId }, "Error getting runs by campaign");
      throw error;
    }
  }

  async findActiveRunByPhone(
    orgId: string,
    phone: string
  ): Promise<RunState | null> {
    try {
      // Query DynamoDB for active runs in this org that include this phone number
      const response = await dynamoDb.send(
        new QueryCommand({
          TableName: this.TABLE_NAME,
          IndexName: "org_status_index",
          KeyConditionExpression: "org_id = :orgId AND #status = :status",
          FilterExpression: "contains(phone_numbers, :phone)",
          ExpressionAttributeNames: {
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":orgId": orgId,
            ":status": RunStatus.RUNNING,
            ":phone": phone,
          },
        })
      );

      return (response.Items?.[0] as RunState) || null;
    } catch (error) {
      logger.error(
        { error, orgId, phone },
        "Error finding active run by phone"
      );
      throw error;
    }
  }

  private async emitStateChange(state: RunState) {
    try {
      await eventBridge.send(
        new PutEventsCommand({
          Entries: [
            {
              EventBusName: this.EVENT_BUS,
              Source: "rivvi.run-state",
              DetailType: "RunStateChange",
              Detail: JSON.stringify(state),
            },
          ],
        })
      );
    } catch (error) {
      logger.error({ error, state }, "Error emitting run state change");
      // Don't throw here - state updates should succeed even if event emission fails
    }
  }
}
