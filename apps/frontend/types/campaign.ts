export type RunStatus =
  | "pending"
  | "in_progress"
  | "paused"
  | "completed"
  | "failed";

export type CallStatus = "not_called" | "calling" | "completed" | "failed";

export interface Run {
  id: string;
  campaignId: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
}

export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
  runs: Run[];
}

export interface RunRecord {
  id: string;
  runId: string;
  patientId: string;
  callStatus: CallStatus;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
