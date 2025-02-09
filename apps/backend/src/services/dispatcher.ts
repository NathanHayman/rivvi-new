import { logger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";
import { CallService } from "./call";
import { RunStateManager, RunStatus } from "./run-state";

const BATCH_SIZE = 10; // Number of calls to process at once

export class Dispatcher {
  private callService: CallService;
  private runStateManager: RunStateManager;

  constructor() {
    this.callService = new CallService();
    this.runStateManager = new RunStateManager();
  }

  async processRun(runId: string) {
    try {
      // Get run details
      const run = await prisma.run.findUnique({
        where: { id: runId },
        include: {
          campaign: true,
          organization: true,
          patients: {
            include: {
              calls: {
                where: { runId },
              },
            },
          },
        },
      });

      if (!run) {
        throw new Error(`Run ${runId} not found`);
      }

      // Initialize run state if not exists
      let runState = await this.runStateManager.getState(runId);
      if (!runState) {
        runState = await this.runStateManager.initializeState(
          runId,
          run.campaignId,
          run.orgId
        );
      }

      // Process patients in batches
      const pendingPatients = run.patients.filter(
        (patient: any) => patient.calls.length === 0
      );

      for (let i = 0; i < pendingPatients.length; i += BATCH_SIZE) {
        const batch = pendingPatients.slice(i, i + BATCH_SIZE);

        // Check active calls against organization limit
        const currentState = await this.runStateManager.getState(runId);
        if (!currentState) {
          throw new Error(`Run state not found for ${runId}`);
        }

        const maxConcurrentCalls = run.organization.maxConcurrentCalls || 5;
        if (currentState.activeCalls >= maxConcurrentCalls) {
          logger.info(
            {
              runId,
              activeCalls: currentState.activeCalls,
              maxConcurrentCalls,
            },
            "Max concurrent calls reached, waiting..."
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        // Calculate how many more calls we can make
        const availableSlots = maxConcurrentCalls - currentState.activeCalls;
        const batchToProcess = batch.slice(0, availableSlots);

        // Dispatch calls for batch
        await Promise.all(
          batchToProcess.map(async (patient: any) => {
            try {
              // Increment active calls before dispatching
              await this.runStateManager.updateState(runId, {
                activeCalls: currentState.activeCalls + 1,
                totalCalls: currentState.totalCalls + 1,
              });

              await this.dispatchCallForPatient(run, patient);
            } catch (error) {
              // Decrement active calls on error
              await this.runStateManager.updateState(runId, {
                activeCalls: currentState.activeCalls,
                failedCalls: currentState.failedCalls + 1,
              });

              logger.error(
                { error, runId, patientId: patient.id },
                "Error dispatching call"
              );
            }
          })
        );

        // Check if run should be paused
        const updatedState = await this.runStateManager.getState(runId);
        if (!updatedState || updatedState.status === RunStatus.PAUSED) {
          logger.info({ runId }, "Run paused, stopping dispatch");
          break;
        }

        // Rate limiting delay between batches
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Check if all calls are completed
      const completedState = await this.runStateManager.getState(runId);
      if (
        completedState &&
        completedState.activeCalls === 0 &&
        completedState.completedCalls + completedState.failedCalls ===
          completedState.totalCalls
      ) {
        await this.runStateManager.updateState(runId, {
          status: RunStatus.COMPLETED,
          lastUpdated: new Date().toISOString(),
        });

        // Update RDS status
        await prisma.run.update({
          where: { id: runId },
          data: { status: "COMPLETED" },
        });
      }
    } catch (error) {
      logger.error({ error, runId }, "Error processing run");
      await Promise.all([
        this.runStateManager.updateState(runId, {
          status: RunStatus.FAILED,
          lastUpdated: new Date().toISOString(),
        }),
        prisma.run.update({
          where: { id: runId },
          data: { status: "FAILED" },
        }),
      ]);
      throw error;
    }
  }

  private async dispatchCallForPatient(run: any, patient: any): Promise<void> {
    try {
      // Get campaign variables for the patient
      const variables = {
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        isMinor: patient.isMinor,
        ...run.campaign.variables,
      };

      // Dispatch call
      await this.callService.dispatchCall({
        runId: run.id,
        patientId: patient.id,
        phoneNumber: patient.phone,
        agentId: run.campaign.agentId,
        variables,
        direction: "OUTBOUND",
      });

      logger.info(
        { runId: run.id, patientId: patient.id },
        "Call dispatched successfully"
      );
    } catch (error) {
      logger.error(
        { error, runId: run.id, patientId: patient.id },
        "Error dispatching call"
      );
      throw error;
    }
  }
}
