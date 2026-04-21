import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { GraphQLClient } from "graphql-request";
import {
  FEATURE_REF_REGEX,
  EPIC_REF_REGEX,
  INITIATIVE_REF_REGEX,
  GOAL_REF_REGEX,
  REQUIREMENT_REF_REGEX,
  NOTE_REF_REGEX,
  IDEA_REF_REGEX,
  Record,
  FeatureResponse,
  EpicResponse,
  InitiativeResponse,
  GoalResponse,
  RequirementResponse,
  PageResponse,
  IdeaResponse,
  SearchResponse,
  WorkspaceListResponse,
  InitiativesListResponse,
  GoalsListResponse,
  ListRecordType,
  PersonaDetail,
  EpicFeaturesListResponse,
  WorkflowStatusesListResponse,
  InitiativeDetailResponse,
} from "./types.js";
import {
  getFeatureQuery,
  getEpicQuery,
  getInitiativeQuery,
  getGoalQuery,
  getRequirementQuery,
  getPageQuery,
  searchDocumentsQuery,
  listWorkspacesQuery,
  listInitiativesQuery,
  listGoalsQuery,
  listFeaturesForEpicQuery,
  listWorkflowStatusesQuery,
  getInitiativeDetailQuery,
} from "./queries.js";

export class Handlers {
  constructor(
    private client: GraphQLClient,
    private domain: string,
    private token: string,
  ) {}

  async handleGetRecord(request: any) {
    const { reference } = request.params.arguments as { reference: string };

    if (!reference) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Reference number is required"
      );
    }

    try {
      let result: unknown;

      if (EPIC_REF_REGEX.test(reference)) {
        const data = await this.client.request<EpicResponse>(
          getEpicQuery,
          { id: reference }
        );
        result = data.epic;
      } else if (INITIATIVE_REF_REGEX.test(reference)) {
        const data = await this.client.request<InitiativeResponse>(
          getInitiativeQuery,
          { id: reference }
        );
        result = data.initiative;
      } else if (GOAL_REF_REGEX.test(reference)) {
        const data = await this.client.request<GoalResponse>(
          getGoalQuery,
          { id: reference }
        );
        result = data.goal;
      } else if (FEATURE_REF_REGEX.test(reference)) {
        const data = await this.client.request<FeatureResponse>(
          getFeatureQuery,
          {
            id: reference,
          }
        );
        result = data.feature;
      } else if (REQUIREMENT_REF_REGEX.test(reference)) {
        const data = await this.client.request<RequirementResponse>(
          getRequirementQuery,
          { id: reference }
        );
        result = data.requirement;
      } else {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Invalid reference number format. Expected DEVELOP-123 or ADT-123-1"
        );
      }

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: `No record found for reference ${reference}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch record: ${errorMessage}`
      );
    }
  }

  async handleGetIdea(request: any) {
    const { reference } = request.params.arguments as { reference: string };

    if (!reference) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Reference number is required",
      );
    }

    if (!IDEA_REF_REGEX.test(reference)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid reference number format. Expected ABC-I-213",
      );
    }

    try {
      const response = await fetch(
        `https://${this.domain}.aha.io/api/v1/ideas/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = (await response.json()) as IdeaResponse;

      if (!data.idea) {
        return {
          content: [
            {
              type: "text",
              text: `No idea found for reference ${reference}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.idea, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch idea: ${errorMessage}`,
      );
    }
  }

  async handleGetPage(request: any) {
    const { reference, includeParent = false } = request.params.arguments as {
      reference: string;
      includeParent?: boolean;
    };

    if (!reference) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Reference number is required"
      );
    }

    if (!NOTE_REF_REGEX.test(reference)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid reference number format. Expected ABC-N-213"
      );
    }

    try {
      const data = await this.client.request<PageResponse>(getPageQuery, {
        id: reference,
        includeParent,
      });

      if (!data.page) {
        return {
          content: [
            {
              type: "text",
              text: `No page found for reference ${reference}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.page, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch page: ${errorMessage}`
      );
    }
  }

  async handleSearchDocuments(request: any) {
    const {
      query,
      searchableType = "Page",
      page,
    } = request.params.arguments as {
      query: string;
      searchableType?: string;
      page?: number;
    };

    if (!query) {
      throw new McpError(ErrorCode.InvalidParams, "Search query is required");
    }

    try {
      const data = await this.client.request<SearchResponse>(
        searchDocumentsQuery,
        {
          query,
          searchableType: [searchableType],
          page,
        }
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.searchDocuments, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search documents: ${errorMessage}`
      );
    }
  }

  async handleListWorkspaces(request: any) {
    const { page } = (request.params.arguments ?? {}) as { page?: number };

    try {
      const data = await this.client.request<WorkspaceListResponse>(
        listWorkspacesQuery,
        { page }
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data.projects, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(ErrorCode.InternalError, `Failed to list workspaces: ${errorMessage}`);
    }
  }

  async handleListRecords(request: any) {
    const { workspaceId, type, page } = request.params.arguments as {
      workspaceId: string;
      type: ListRecordType;
      page?: number;
    };

    if (!workspaceId) {
      throw new McpError(ErrorCode.InvalidParams, "workspaceId is required");
    }
    if (!type) {
      throw new McpError(ErrorCode.InvalidParams, "type is required");
    }

    try {
      if (type === "idea") {
        const url = `https://${this.domain}.aha.io/api/v1/products/${workspaceId}/ideas${page ? `?page=${page}` : ""}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      let result: unknown;
      if (type === "feature") {
        const url = `https://${this.domain}.aha.io/api/v1/products/${workspaceId}/features${page ? `?page=${page}` : ""}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`API responded with status ${response.status}`);
        result = await response.json();
      } else if (type === "epic") {
        const url = `https://${this.domain}.aha.io/api/v1/products/${workspaceId}/epics${page ? `?page=${page}` : ""}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`API responded with status ${response.status}`);
        result = await response.json();
      } else if (type === "initiative") {
        const data = await this.client.request<InitiativesListResponse>(listInitiativesQuery, { workspaceId });
        result = data.project.initiatives;
      } else if (type === "goal") {
        const data = await this.client.request<GoalsListResponse>(listGoalsQuery, { workspaceId });
        result = data.project.goals;
      } else if (type === "persona") {
        const url = `https://${this.domain}.aha.io/api/v1/products/${workspaceId}/personas${page ? `?page=${page}` : ""}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`API responded with status ${response.status}`);
        result = await response.json();
      } else {
        throw new McpError(ErrorCode.InvalidParams, `Unknown type: ${type}. Valid types: feature, epic, initiative, goal, idea, persona`);
      }

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(ErrorCode.InternalError, `Failed to list records: ${errorMessage}`);
    }
  }

  async handleGetPersona(request: any) {
    const { workspaceId, id } = request.params.arguments as { workspaceId: string; id: string };

    if (!workspaceId) {
      throw new McpError(ErrorCode.InvalidParams, "workspaceId is required");
    }
    if (!id) {
      throw new McpError(ErrorCode.InvalidParams, "id is required");
    }

    try {
      const response = await fetch(
        `https://${this.domain}.aha.io/api/v1/products/${workspaceId}/personas/${id}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = (await response.json()) as { persona: PersonaDetail };

      if (!data.persona) {
        return {
          content: [{ type: "text", text: `No persona found with id ${id} in workspace ${workspaceId}` }],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data.persona, null, 2) }] };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(ErrorCode.InternalError, `Failed to fetch persona: ${errorMessage}`);
    }
  }

  async handleListFeaturesForEpic(request: any) {
    const { epic_reference, page } = request.params.arguments as {
      epic_reference: string;
      page?: number;
    };

    if (!epic_reference) {
      throw new McpError(ErrorCode.InvalidParams, "epic_reference is required");
    }

    if (!EPIC_REF_REGEX.test(epic_reference)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid epic reference format. Expected PREFIX-E-NUM (e.g., ZS-E-28)"
      );
    }

    try {
      const data = await this.client.request<EpicFeaturesListResponse>(
        listFeaturesForEpicQuery,
        { epicId: epic_reference }
      );

      if (!data.epic) {
        return {
          content: [{ type: "text", text: `No epic found for reference ${epic_reference}` }],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(data.epic, null, 2) }],
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch features for epic: ${errorMessage}`
      );
    }
  }

  async handleListWorkflowStatuses(request: any) {
    const { workspaceId } = request.params.arguments as { workspaceId: string };

    if (!workspaceId) {
      throw new McpError(ErrorCode.InvalidParams, "workspaceId is required");
    }

    try {
      const data = await this.client.request<WorkflowStatusesListResponse>(
        listWorkflowStatusesQuery,
        { workspaceId }
      );

      const nodes = data.features?.nodes ?? [];
      if (nodes.length === 0) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              workspaceId,
              message: "No features found in workspace to derive workflow statuses",
              workflowStatuses: [],
            }, null, 2),
          }],
        };
      }

      // Deduplicate by workflow name, return all unique workflows found
      const workflowsByName = new Map<string, { workflowKindName: string; workflowName: string; statuses: object[] }>();
      for (const node of nodes) {
        const wf = node.workflowKind?.workflow;
        if (wf && !workflowsByName.has(wf.name)) {
          workflowsByName.set(wf.name, {
            workflowKindName: node.workflowKind.name,
            workflowName: wf.name,
            statuses: wf.workflowStatuses,
          });
        }
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            workspaceId,
            totalFeatures: data.features.totalCount,
            workflows: Array.from(workflowsByName.values()),
          }, null, 2),
        }],
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch workflow statuses: ${errorMessage}`
      );
    }
  }

  async handleGetInitiative(request: any) {
    const { reference } = request.params.arguments as { reference: string };

    if (!reference) {
      throw new McpError(ErrorCode.InvalidParams, "Reference number is required");
    }

    if (!INITIATIVE_REF_REGEX.test(reference)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid initiative reference format. Expected PREFIX-S-NUM (e.g., ZS-S-4)"
      );
    }

    try {
      const data = await this.client.request<InitiativeDetailResponse>(
        getInitiativeDetailQuery,
        { id: reference }
      );

      if (!data.initiative) {
        return {
          content: [{ type: "text", text: `No initiative found for reference ${reference}` }],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(data.initiative, null, 2) }],
      };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch initiative: ${errorMessage}`
      );
    }
  }
}
