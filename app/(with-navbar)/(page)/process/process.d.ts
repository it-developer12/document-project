export interface Workflow {
  status: WorkflowStatus;
  current_stage: WorkflowStageId;

  stages: WorkflowStage[];
}

interface WorkflowStage {
  id: WorkflowStageId;
  name: string;

  status: StageStatus;

  started_at?: string;
  completed_at?: string;

  activities: WorkflowActivity[];
}

export interface WorkflowActivity {
  id: string;

  type: ActivityType;

  title: string;
  description?: string;

  performed_by: User;

  datetime: string;
}

interface User {
  id: string;
  name: string;
}

type WorkflowStageId =
  | "created"
  | "approve"
  | "processing"
  | "complete";

type WorkflowStatus =
  | "in_progress"
  | "completed"
  | "rejected"
  | "cancelled";

type StageStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "rejected"
  | "cancelled";

type ActivityType =
  | "submitted"
  | "approved"
  | "processing_started"
  | "processing_update"
  | "completed"
  | "rejected"
  | "cancelled";