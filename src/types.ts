export interface Description {
  htmlBody: string;
}

export interface IntegrationLink {
  name: string;
  url: string;
  integration: {
    serviceName: string;
  };
}

export interface WorkflowStatusDetail {
  name: string;
  internalMeaning: string | null;
}

export interface UserRef {
  name: string;
  email: string | null;
}

export interface TagItem {
  name: string;
}

export interface RequirementItem {
  referenceNum: string;
  name: string | null;
  workflowStatus: WorkflowStatusDetail;
  description: { markdownBody: string };
}

export interface EpicRef {
  referenceNum: string;
  name: string;
}

export interface InitiativeRef {
  referenceNum: string | null;
  name: string;
}

export interface FeatureSummary {
  referenceNum: string;
  name: string;
  workflowStatus: WorkflowStatusDetail;
  dueDate: string | null;
  startDate: string | null;
  assignedToUser: UserRef | null;
  tagList: string;
  description: { markdownBody: string };
  integrationLinks: IntegrationLink[];
}

export interface FeatureDetail {
  referenceNum: string;
  name: string;
  description: { markdownBody: string };
  workflowStatus: WorkflowStatusDetail;
  tagList: string;
  tags: TagItem[];
  dueDate: string | null;
  startDate: string | null;
  assignedToUser: UserRef | null;
  epic: EpicRef | null;
  integrationLinks: IntegrationLink[];
  requirements: RequirementItem[];
}

export interface EpicDetail {
  referenceNum: string;
  name: string;
  description: { markdownBody: string };
  workflowStatus: WorkflowStatusDetail;
  tagList: string;
  tags: TagItem[];
  dueDate: string | null;
  startDate: string | null;
  assignedToUser: UserRef | null;
  initiative: InitiativeRef | null;
  featuresCount: number;
  features: FeatureSummary[];
  integrationLinks: IntegrationLink[];
}

// Simple record for goal/initiative/requirement responses that only need name+description
export interface Record {
  name: string;
  description: Description;
  integrationLinks?: IntegrationLink[];
}

export interface FeatureResponse {
  feature: FeatureDetail;
}

export interface RequirementResponse {
  requirement: Record;
}

export interface PageResponse {
  page: {
    name: string;
    description: Description;
    children: Array<{
      name: string;
      referenceNum: string;
    }>;
    parent?: {
      name: string;
      referenceNum: string;
    };
  };
}

export interface IdeaResponse {
  idea: unknown;
}

export interface EpicResponse {
  epic: EpicDetail;
}

export interface InitiativeResponse {
  initiative: Record;
}

export interface GoalResponse {
  goal: Record;
}

export interface EpicFeaturesListResponse {
  epic: {
    referenceNum: string;
    name: string;
    featuresCount: number;
    features: FeatureSummary[];
  };
}

export interface WorkflowStatusInfo {
  name: string;
  internalMeaning: string | null;
  position: number;
}

export interface WorkflowStatusesListResponse {
  features: {
    nodes: Array<{
      workflowKind: {
        name: string;
        workflow: {
          name: string;
          workflowStatuses: WorkflowStatusInfo[];
        };
      };
    }>;
    totalCount: number;
  };
}

export interface InitiativeDetail {
  referenceNum: string | null;
  name: string;
  description: { markdownBody: string };
  workflowStatus: WorkflowStatusDetail;
  epics: Array<{
    referenceNum: string;
    name: string;
    workflowStatus: WorkflowStatusDetail;
  }>;
  epicsCount: number;
}

export interface InitiativeDetailResponse {
  initiative: InitiativeDetail;
}

// Regular expressions for validating reference numbers
export const FEATURE_REF_REGEX = /^([A-Z][A-Z0-9]*)-(\d+)$/;
export const EPIC_REF_REGEX = /^([A-Z][A-Z0-9]*)-E-(\d+)$/;
export const INITIATIVE_REF_REGEX = /^([A-Z][A-Z0-9]*)-S-(\d+)$/;
export const GOAL_REF_REGEX = /^([A-Z][A-Z0-9]*)-G-(\d+)$/;
export const REQUIREMENT_REF_REGEX = /^([A-Z][A-Z0-9]*)-(\d+)-(\d+)$/;
export const NOTE_REF_REGEX = /^([A-Z][A-Z0-9]*)-N-(\d+)$/;
export const IDEA_REF_REGEX = /^([A-Z][A-Z0-9]*)-I-(\d+)$/;

export interface SearchNode {
  name: string | null;
  url: string;
  searchableId: string;
  searchableType: string;
}

export interface SearchResponse {
  searchDocuments: {
    nodes: SearchNode[];
    currentPage: number;
    totalCount: number;
    totalPages: number;
    isLastPage: boolean;
  };
}

export interface WorkspaceNode {
  id: string;
  referencePrefix: string;
  name: string;
}

export interface WorkspaceListResponse {
  projects: {
    nodes: WorkspaceNode[];
    currentPage: number;
    totalCount: number;
    totalPages: number;
    isLastPage: boolean;
  };
}

export interface RecordListNode {
  referenceNum: string;
  name: string;
}

export interface PaginatedRecordList {
  nodes: RecordListNode[];
  currentPage: number;
  totalCount: number;
  totalPages: number;
  isLastPage: boolean;
}

export interface FeaturesListResponse {
  features: { nodes: RecordListNode[]; currentPage: number; totalPages: number; isLastPage: boolean; totalCount: number };
}

export interface EpicsListResponse {
  epics: { nodes: RecordListNode[]; currentPage: number; totalPages: number; isLastPage: boolean; totalCount: number };
}

export interface InitiativesListResponse {
  project: { initiatives: RecordListNode[] };
}

export interface GoalsListResponse {
  project: { goals: RecordListNode[] };
}

export type ListRecordType = "feature" | "epic" | "initiative" | "goal" | "idea" | "persona";

export interface PersonaNode {
  id: string;
  name: string;
}

export interface PersonaDetail {
  id: string;
  name: string;
  description?: { htmlBody?: string };
  color?: string;
}
