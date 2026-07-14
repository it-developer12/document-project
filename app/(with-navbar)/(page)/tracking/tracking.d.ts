export interface DocumentTracking {
  document_id: string;
  schema_id: string;
  title: string;
  department: string;
  type: string;
  priority: Priority;

  workflow: Workflow;

  created_by: User;
  updated_at: string;
  due_date?: string;
  note?: string;
}

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

export interface DocumentTrackingRecord {
  document_id: string;
  schema_id: string;
  schema_version: string;
  iso_document_id: string;
  created_at: string;
  due_dete: string;
  approval: Approval;
  answer: any;
}

export interface Approval {
  type: "workflow";
  current_level: number;
  steps: ApprovalStep[];
}

export interface ApprovalStep {
  level: number;
  status: string;
  approvers: ApprovalApprover[];
}

export interface ApprovalApprover {
  employee_id: string;
  name: string;
  status: string;
  approved_at: string;
}


