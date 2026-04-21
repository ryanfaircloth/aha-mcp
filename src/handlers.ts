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
  FeaturesListResponse,
  EpicsListResponse,
  InitiativesListResponse,
  GoalsListResponse,
  ListRecordType,
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
  listFeaturesQuery,
  listEpicsQuery,
  listInitiativesQuery,
  listGoalsQuery,
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
      let result: Record | undefined;

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
            text: JSON.stringify(data.products, null, 2),
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
        const data = await this.client.request<FeaturesListResponse>(listFeaturesQuery, { workspaceId, page });
        result = data.product.features;
      } else if (type === "epic") {
        const data = await this.client.request<EpicsListResponse>(listEpicsQuery, { workspaceId, page });
        result = data.product.epics;
      } else if (type === "initiative") {
        const data = await this.client.request<InitiativesListResponse>(listInitiativesQuery, { workspaceId, page });
        result = data.product.initiatives;
      } else if (type === "goal") {
        const data = await this.client.request<GoalsListResponse>(listGoalsQuery, { workspaceId, page });
        result = data.product.goals;
      } else {
        throw new McpError(ErrorCode.InvalidParams, `Unknown type: ${type}. Valid types: feature, epic, initiative, goal, idea`);
      }

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      if (error instanceof McpError) throw error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API Error:", errorMessage);
      throw new McpError(ErrorCode.InternalError, `Failed to list records: ${errorMessage}`);
    }
  }
}
