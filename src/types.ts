export interface Description {
  htmlBody: string;
}

export interface Record {
  name: string;
  description: Description;
}

export interface FeatureResponse {
  feature: Record;
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
  epic: Record;
}

export interface InitiativeResponse {
  initiative: Record;
}

export interface GoalResponse {
  goal: Record;
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
  products: {
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
  features: PaginatedRecordList;
}

export interface EpicsListResponse {
  epics: PaginatedRecordList;
}

export interface InitiativesListResponse {
  initiatives: PaginatedRecordList;
}

export interface GoalsListResponse {
  goals: PaginatedRecordList;
}

export type ListRecordType = "feature" | "epic" | "initiative" | "goal" | "idea";
