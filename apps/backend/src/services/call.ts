import { dynamoDb } from "@/utils/aws";
import { logger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";
import { PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

export type CallDirection = "INBOUND" | "OUTBOUND";

interface DispatchCallInput {
  runId: string;
  patientId: string;
  phoneNumber: string;
  agentId: string;
  variables: Record<string, any>;
  direction: CallDirection;
}

export class CallService {
  async dispatchCall(input: DispatchCallInput) {
    try {
      // Create call record in RDS
      const call = await prisma.call.create({
        data: {
          runId: input.runId,
          patientId: input.patientId,
          status: "PENDING",
          direction: input.direction,
        },
      });

      // Store call in DynamoDB for real-time tracking
      await dynamoDb.send(
        new PutItemCommand({
          TableName: process.env.DYNAMODB_CALLS_TABLE,
          Item: {
            call_id: { S: call.id },
            run_id: { S: input.runId },
            patient_id: { S: input.patientId },
            status: { S: "PENDING" },
            direction: { S: input.direction },
            phone_number: { S: input.phoneNumber },
            agent_id: { S: input.agentId },
            variables: { M: this.marshallVariables(input.variables) },
            created_at: { N: Date.now().toString() },
          },
        })
      );

      // TODO: Implement Retail AI call dispatch
      // This would make an API call to Retail AI to initiate the call

      return call;
    } catch (error) {
      logger.error({ error, input }, "Error dispatching call");
      throw error;
    }
  }

  async getActiveCalls(runId: string) {
    try {
      const response = await dynamoDb.send(
        new QueryCommand({
          TableName: process.env.DYNAMODB_CALLS_TABLE,
          KeyConditionExpression: "run_id = :runId",
          FilterExpression: "#status = :status",
          ExpressionAttributeNames: {
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":runId": { S: runId },
            ":status": { S: "IN_PROGRESS" },
          },
        })
      );

      return response.Items?.length || 0;
    } catch (error) {
      logger.error({ error, runId }, "Error getting active calls");
      throw error;
    }
  }

  private marshallVariables(variables: Record<string, any>) {
    const marshalled: Record<string, any> = {};
    for (const [key, value] of Object.entries(variables)) {
      marshalled[key] = { S: String(value) };
    }
    return marshalled;
  }
}
