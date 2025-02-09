import { dynamoDb, s3Client } from "@/utils/aws";
import { logger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ExcelProcessor } from "./excel";
import { RunStateManager, RunStatus } from "./run-state";

interface CreateRunInput {
  name: string;
  campaignId: string;
  orgId: string;
  scheduledStart?: Date;
}

export class RunService {
  private excelProcessor: ExcelProcessor;
  private runState: RunStateManager;

  constructor() {
    this.excelProcessor = new ExcelProcessor();
    this.runState = new RunStateManager();
  }

  async getRun(runId: string) {
    try {
      const [run, dynamoState] = await Promise.all([
        prisma.run.findUnique({
          where: { id: runId },
          include: {
            campaign: true,
            patients: true,
            calls: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        }),
        this.runState.getState(runId),
      ]);

      if (!run) {
        throw new Error("Run not found");
      }

      return {
        ...run,
        activeCalls: dynamoState?.activeCalls || 0,
      };
    } catch (error) {
      logger.error({ error, runId }, "Error getting run");
      throw error;
    }
  }

  async createRun(input: CreateRunInput) {
    try {
      // Check if organization has any active runs
      const activeRun = await prisma.run.findFirst({
        where: {
          orgId: input.orgId,
          status: { in: ["PROCESSING", "RUNNING"] },
        },
      });

      if (activeRun) {
        throw new Error("Organization already has an active run");
      }

      // Create new run
      const run = await prisma.run.create({
        data: {
          name: input.name,
          campaignId: input.campaignId,
          orgId: input.orgId,
          status: "PENDING",
          scheduledStart: input.scheduledStart,
          dynamoTableName: process.env.DYNAMODB_RUNS_TABLE,
        },
        include: {
          campaign: true,
          organization: true,
        },
      });

      // Initialize run state in DynamoDB
      await this.runState.initializeState(run.id, run.campaignId, run.orgId);

      return run;
    } catch (error) {
      logger.error({ error, input }, "Error creating run");
      throw error;
    }
  }

  async processUpload(runId: string, file: Buffer) {
    try {
      const run = await prisma.run.findUnique({
        where: { id: runId },
        include: { campaign: true },
      });

      if (!run) {
        throw new Error("Run not found");
      }

      // Store raw file in S3
      const rawKey = `raw-uploads/${runId}/${Date.now()}.xlsx`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_RAW,
          Key: rawKey,
          Body: file,
          ContentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );

      // Update run with raw file location
      await prisma.run.update({
        where: { id: runId },
        data: {
          rawFileUrl: rawKey,
          status: "PROCESSING",
        },
      });

      // Process Excel file
      const { validRows, invalidRows, patients } =
        await this.excelProcessor.processFile(
          rawKey,
          run.campaignId,
          run.orgId
        );

      // Store processed data in S3
      const processedKey = `processed-data/${runId}/${Date.now()}.json`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_PROCESSED,
          Key: processedKey,
          Body: JSON.stringify(validRows),
          ContentType: "application/json",
        })
      );

      // Store run data in DynamoDB for real-time access
      await dynamoDb.send(
        new PutItemCommand({
          TableName: process.env.DYNAMODB_RUNS_TABLE,
          Item: {
            run_id: { S: runId },
            status: { S: "READY" },
            processed_file_url: { S: processedKey },
            total_records: { N: String(validRows.length + invalidRows.length) },
            valid_records: { N: String(validRows.length) },
            invalid_records: { N: String(invalidRows.length) },
          },
        })
      );

      // Update run status in RDS
      await prisma.run.update({
        where: { id: runId },
        data: {
          processedFileUrl: processedKey,
          totalRecords: validRows.length + invalidRows.length,
          validRecords: validRows.length,
          invalidRecords: invalidRows.length,
          status: "READY",
        },
      });

      // Create or update patients in RDS
      for (const [hash, patient] of patients.entries()) {
        await prisma.patient.upsert({
          where: { hash },
          create: {
            ...patient,
            orgId: run.orgId,
            runs: { connect: { id: runId } },
          },
          update: {
            runs: { connect: { id: runId } },
          },
        });
      }

      return {
        processedFileUrl: processedKey,
        totalRecords: validRows.length + invalidRows.length,
        validRecords: validRows.length,
        invalidRecords: invalidRows.length,
      };
    } catch (error) {
      logger.error({ error, runId }, "Error processing run upload");
      throw error;
    }
  }

  async startRun(runId: string) {
    try {
      const run = await prisma.run.findUnique({
        where: { id: runId },
        include: { campaign: true, organization: true },
      });

      if (!run) {
        throw new Error("Run not found");
      }

      if (run.status !== "READY") {
        throw new Error("Run is not ready to start");
      }

      // Check for active runs in the organization
      const activeRun = await prisma.run.findFirst({
        where: {
          orgId: run.orgId,
          status: "RUNNING",
        },
      });

      if (activeRun) {
        throw new Error("Organization already has an active run");
      }

      // Update run status in both RDS and DynamoDB
      await Promise.all([
        prisma.run.update({
          where: { id: runId },
          data: { status: "RUNNING" },
        }),
        this.runState.updateState(runId, {
          status: RunStatus.RUNNING,
          lastUpdated: new Date().toISOString(),
        }),
      ]);

      return run;
    } catch (error) {
      logger.error({ error, runId }, "Error starting run");
      throw error;
    }
  }

  async pauseRun(runId: string) {
    try {
      const [run, dynamoState] = await Promise.all([
        prisma.run.findUnique({
          where: { id: runId },
        }),
        this.runState.getState(runId),
      ]);

      if (!run) {
        throw new Error("Run not found");
      }

      if (run.status !== "RUNNING") {
        throw new Error("Run is not currently running");
      }

      if (dynamoState?.activeCalls > 0) {
        throw new Error("Cannot pause run with active calls");
      }

      // Update run status in both RDS and DynamoDB
      await Promise.all([
        prisma.run.update({
          where: { id: runId },
          data: { status: "PAUSED" },
        }),
        this.runState.updateState(runId, {
          status: RunStatus.PAUSED,
          lastUpdated: new Date().toISOString(),
        }),
      ]);

      return run;
    } catch (error) {
      logger.error({ error, runId }, "Error pausing run");
      throw error;
    }
  }

  async finishRun(runId: string) {
    try {
      const [run, dynamoState] = await Promise.all([
        prisma.run.findUnique({
          where: { id: runId },
        }),
        this.runState.getState(runId),
      ]);

      if (!run) {
        throw new Error("Run not found");
      }

      if (run.status !== "RUNNING" && run.status !== "PAUSED") {
        throw new Error("Run must be running or paused to finish");
      }

      if (dynamoState?.activeCalls > 0) {
        throw new Error("Cannot finish run with active calls");
      }

      // Update run status in both RDS and DynamoDB
      await Promise.all([
        prisma.run.update({
          where: { id: runId },
          data: { status: "COMPLETED" },
        }),
        this.runState.updateState(runId, {
          status: RunStatus.COMPLETED,
          lastUpdated: new Date().toISOString(),
        }),
      ]);

      return run;
    } catch (error) {
      logger.error({ error, runId }, "Error finishing run");
      throw error;
    }
  }
}
