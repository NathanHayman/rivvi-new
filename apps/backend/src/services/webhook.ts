import { dynamoDb, s3 } from "@/utils/aws";
import { logger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { CallDirection, CallStatus } from "@prisma/client";
import crypto from "crypto";
import { RunStateManager, RunStatus } from "./run-state";

const sqs = new SQSClient({});
const runStateManager = new RunStateManager();

interface RetellAIWebhook {
  type: string;
  direction: "inbound" | "outbound";
  metadata?: {
    run_id?: string;
    campaign_id?: string;
    org_id?: string;
    row_id?: string;
  };
  call_id: string;
  patient_data?: {
    first_name: string;
    last_name: string;
    dob: string;
    phone: string;
  };
  analysis?: any;
  timestamp: string;
}

interface BatchMessage {
  webhook: RetellAIWebhook;
  s3Key: string;
  timestamp: string;
  retryCount?: number;
}

export class WebhookProcessor {
  private readonly WEBHOOK_BUCKET = process.env.S3_WEBHOOK_BUCKET!;
  private readonly QUEUE_URL = process.env.SQS_WEBHOOK_QUEUE!;
  private readonly DLQ_URL = process.env.SQS_WEBHOOK_DLQ!;
  private readonly MAX_RETRIES = 3;

  async processWebhook(webhook: RetellAIWebhook): Promise<void> {
    try {
      // Only process call_analyzed events
      if (webhook.type !== "call_analyzed") {
        logger.info({ webhook }, "Ignoring non-call_analyzed webhook");
        return;
      }

      // Store raw webhook in S3
      const s3Key = await this.storeRawWebhook(webhook);

      // Process based on direction
      if (webhook.direction === "inbound") {
        await this.handleInboundCall(webhook, s3Key);
      } else {
        await this.handleOutboundCall(webhook, s3Key);
      }

      // Queue webhook for RDS batch processing
      await this.queueForBatchProcessing(webhook, s3Key);
    } catch (error) {
      logger.error({ error, webhook }, "Error processing webhook");
      throw error;
    }
  }

  private async storeRawWebhook(webhook: RetellAIWebhook): Promise<string> {
    const s3Key = `webhooks/${webhook.direction}/${webhook.call_id}/${webhook.type}-${Date.now()}.json`;

    await s3.send(
      new PutObjectCommand({
        Bucket: this.WEBHOOK_BUCKET,
        Key: s3Key,
        Body: JSON.stringify(webhook),
        ContentType: "application/json",
      })
    );

    return s3Key;
  }

  private async handleInboundCall(
    webhook: RetellAIWebhook,
    s3Key: string
  ): Promise<void> {
    const { call_id, metadata, patient_data } = webhook;

    // Try to find active run context if this is a callback
    let runContext = null;
    if (metadata?.org_id && patient_data?.phone) {
      const activeRun = await runStateManager.findActiveRunByPhone(
        metadata.org_id,
        patient_data.phone
      );
      if (activeRun) {
        runContext = activeRun;

        // Update run state with new active call
        await runStateManager.updateState(activeRun.run_id, {
          activeCalls: (activeRun.activeCalls || 0) + 1,
          totalCalls: (activeRun.totalCalls || 0) + 1,
        });
      }
    }

    // Store in DynamoDB for real-time access
    await dynamoDb.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_CALLS_TABLE!,
        Item: {
          call_id,
          direction: CallDirection.INBOUND,
          run_id: runContext?.run_id,
          campaign_id: runContext?.campaign_id,
          org_id: metadata?.org_id,
          patient_data,
          webhook_url: s3Key,
          status: CallStatus.COMPLETED,
          timestamp: webhook.timestamp,
          created_at: Date.now(),
        },
      })
    );
  }

  private async handleOutboundCall(
    webhook: RetellAIWebhook,
    s3Key: string
  ): Promise<void> {
    const { call_id, metadata } = webhook;

    if (!metadata?.run_id) {
      throw new Error("Outbound call webhook missing run_id");
    }

    // Update run state
    const currentState = await runStateManager.getState(metadata.run_id);
    if (!currentState) {
      throw new Error(`Run ${metadata.run_id} not found`);
    }

    // Update run state
    await runStateManager.updateState(metadata.run_id, {
      activeCalls: Math.max(0, (currentState.activeCalls || 0) - 1),
      completedCalls: (currentState.completedCalls || 0) + 1,
      lastUpdated: new Date().toISOString(),
    });

    // Check if run is complete
    const updatedState = await runStateManager.getState(metadata.run_id);
    if (
      updatedState &&
      updatedState.activeCalls === 0 &&
      updatedState.completedCalls + updatedState.failedCalls ===
        updatedState.totalCalls
    ) {
      await Promise.all([
        runStateManager.updateState(metadata.run_id, {
          status: RunStatus.COMPLETED,
          lastUpdated: new Date().toISOString(),
        }),
        prisma.run.update({
          where: { id: metadata.run_id },
          data: { status: "COMPLETED" },
        }),
      ]);
    }

    // Store call result in DynamoDB
    await dynamoDb.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_CALLS_TABLE!,
        Item: {
          call_id,
          run_id: metadata.run_id,
          campaign_id: metadata.campaign_id,
          org_id: metadata.org_id,
          direction: CallDirection.OUTBOUND,
          row_id: metadata.row_id,
          webhook_url: s3Key,
          status: CallStatus.COMPLETED,
          timestamp: webhook.timestamp,
          created_at: Date.now(),
        },
      })
    );
  }

  private async queueForBatchProcessing(
    webhook: RetellAIWebhook,
    s3Key: string
  ): Promise<void> {
    const message: BatchMessage = {
      webhook,
      s3Key,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    await sqs.send(
      new SendMessageCommand({
        QueueUrl: this.QUEUE_URL,
        MessageBody: JSON.stringify(message),
        MessageAttributes: {
          direction: {
            DataType: "String",
            StringValue: webhook.direction,
          },
          type: {
            DataType: "String",
            StringValue: webhook.type,
          },
        },
      })
    );
  }

  async processBatchUpdate(messages: any[]): Promise<void> {
    const updates = messages.map(async (message) => {
      const {
        webhook,
        s3Key,
        retryCount = 0,
      } = JSON.parse(message.body) as BatchMessage;
      const { call_id, metadata, direction, patient_data } = webhook;

      try {
        // Start a transaction for atomicity
        await prisma.$transaction(async (tx) => {
          // Find or create patient (using hash for deduplication)
          let patient = null;
          if (patient_data) {
            const patientHash = this.generatePatientHash(patient_data);
            patient = await tx.patient.upsert({
              where: { hash: patientHash },
              create: {
                hash: patientHash,
                firstName: patient_data.first_name,
                lastName: patient_data.last_name,
                phone: patient_data.phone,
                dob: new Date(patient_data.dob),
                orgId: metadata?.org_id!,
                isMinor: this.calculateIsMinor(patient_data.dob),
              },
              update: {}, // Don't update if exists
            });
          }

          // Create call record
          await tx.call.create({
            data: {
              id: call_id,
              direction:
                direction === "inbound"
                  ? CallDirection.INBOUND
                  : CallDirection.OUTBOUND,
              status: CallStatus.COMPLETED,
              rawWebhookUrl: s3Key,
              patientId: patient?.id,
              runId: metadata?.run_id,
              campaignId: metadata?.campaign_id,
              orgId: metadata?.org_id,
              variables: metadata || {},
              result: webhook.analysis || {},
            },
          });
        });
      } catch (error) {
        logger.error(
          { error, webhook, retryCount },
          "Error processing batch update"
        );
        await this.handleBatchError(message, retryCount);
      }
    });

    await Promise.all(updates);
  }

  private generatePatientHash(patient: any): string {
    const str =
      `${patient.first_name}|${patient.last_name}|${patient.dob}|${patient.phone}`.toLowerCase();
    return crypto.createHash("sha256").update(str).digest("hex");
  }

  private calculateIsMinor(dob: string): boolean {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  }

  private async handleBatchError(
    message: any,
    retryCount: number
  ): Promise<void> {
    const parsedMessage = JSON.parse(message.body) as BatchMessage;

    if (retryCount < this.MAX_RETRIES) {
      // Increment retry count and requeue
      parsedMessage.retryCount = retryCount + 1;
      await this.queueForBatchProcessing(
        parsedMessage.webhook,
        parsedMessage.s3Key
      );
    } else {
      // Move to DLQ after max retries
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: this.DLQ_URL,
          MessageBody: JSON.stringify({
            ...parsedMessage,
            error: "Max retries exceeded",
          }),
        })
      );
    }
  }
}
