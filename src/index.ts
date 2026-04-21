#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { GraphQLClient } from "graphql-request";
import { Handlers } from "./handlers.js";

const AHA_API_TOKEN = process.env.AHA_API_TOKEN;
const AHA_DOMAIN = process.env.AHA_DOMAIN;

if (!AHA_API_TOKEN) {
  throw new Error("AHA_API_TOKEN environment variable is required");
}

if (!AHA_DOMAIN) {
  throw new Error("AHA_DOMAIN environment variable is required");
}

const client = new GraphQLClient(
  `https://${AHA_DOMAIN}.aha.io/api/v2/graphql`,
  {
    headers: {
      Authorization: `Bearer ${AHA_API_TOKEN}`,
    },
  }
);

class AhaMcp {
  private server: Server;
  private handlers: Handlers;

  constructor() {
    this.server = new Server(
      {
        name: "aha-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.handlers = new Handlers(client, AHA_DOMAIN!, AHA_API_TOKEN!);
    this.setupToolHandlers();

    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_record",
          description: "Get an Aha! feature, epic, requirement, initiative, or goal by reference number. Features return: workflow_status, parent epic, requirements, tags, assigned_to_user, due_date, and GitHub/integration links. Epics return: workflow_status, initiative parent, features list with statuses, tags, due_date, and integration links.",
          inputSchema: {
            type: "object",
            properties: {
              reference: {
                type: "string",
                description:
                  "Reference number (e.g., DEVELOP-123 or ADT-123-1)",
              },
            },
            required: ["reference"],
          },
        },
        {
          name: "get_page",
          description:
            "Get an Aha! page by reference number with optional relationships",
          inputSchema: {
            type: "object",
            properties: {
              reference: {
                type: "string",
                description: "Reference number (e.g., ABC-N-213)",
              },
              includeParent: {
                type: "boolean",
                description: "Include parent page in the response",
                default: false,
              },
            },
            required: ["reference"],
          },
        },
        {
          name: "get_idea",
          description: "Get an Aha! idea by reference number",
          inputSchema: {
            type: "object",
            properties: {
              reference: {
                type: "string",
                description: "Reference number (e.g., ABC-I-213)",
              },
            },
            required: ["reference"],
          },
        },
        {
          name: "search_documents",
          description: "Search for Aha! documents. Supported searchableType values: Page, Feature, Epic, Requirement, Initiative, Goal, Idea.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query string",
              },
              searchableType: {
                type: "string",
                description: "Type of document to search for. Valid values: Page, Feature, Epic, Requirement, Initiative, Goal, Idea",
                default: "Page",
              },
              page: {
                type: "integer",
                description: "Page number for pagination",
                default: 1,
              },
            },
            required: ["query"],
          },
        },
        {
          name: "list_workspaces",
          description: "List all Aha! workspaces accessible with the current credentials",
          inputSchema: {
            type: "object",
            properties: {
              page: {
                type: "integer",
                description: "Page number for pagination",
                default: 1,
              },
            },
          },
        },
        {
          name: "list_records",
          description: "List Aha! records (features, epics, initiatives, goals, or ideas) in a workspace",
          inputSchema: {
            type: "object",
            properties: {
              workspaceId: {
                type: "string",
                description: "Workspace reference prefix (e.g., PROJ)",
              },
              type: {
                type: "string",
                description: "Type of record to list",
                enum: ["feature", "epic", "initiative", "goal", "idea", "persona"],
              },
              page: {
                type: "integer",
                description: "Page number for pagination",
                default: 1,
              },
            },
            required: ["workspaceId", "type"],
          },
        },
        {
          name: "get_persona",
          description: "Get an Aha! persona by workspace and numeric ID",
          inputSchema: {
            type: "object",
            properties: {
              workspaceId: {
                type: "string",
                description: "Workspace reference prefix (e.g., PROJ)",
              },
              id: {
                type: "string",
                description: "Numeric persona ID (from list_records with type=persona)",
              },
            },
            required: ["workspaceId", "id"],
          },
        },
        {
          name: "list_features_for_epic",
          description: "List all features under an Aha! epic with full details: workflow status, description, due date, assigned user, tags, and GitHub/integration links. Use this to load the full content of an epic for roadmap building.",
          inputSchema: {
            type: "object",
            properties: {
              epic_reference: {
                type: "string",
                description: "Epic reference number (e.g., ZS-E-28)",
              },
            },
            required: ["epic_reference"],
          },
        },
        {
          name: "list_workflow_statuses",
          description: "List all workflow status values for a workspace so an agent can understand the feature lifecycle (e.g., Under consideration → In development → Shipped). Returns status names, their lifecycle category (internalMeaning), and position.",
          inputSchema: {
            type: "object",
            properties: {
              workspaceId: {
                type: "string",
                description: "Workspace reference prefix (e.g., ZS)",
              },
            },
            required: ["workspaceId"],
          },
        },
        {
          name: "get_initiative",
          description: "Get an Aha! initiative by reference number, including its workflow status, description, and the full list of child epics with their statuses. Useful for understanding high-level roadmap structure.",
          inputSchema: {
            type: "object",
            properties: {
              reference: {
                type: "string",
                description: "Initiative reference number (e.g., ZS-S-4). Note: initiatives use the -S- prefix.",
              },
            },
            required: ["reference"],
          },
        },
        {
          name: "list_releases",
          description: "List releases in an Aha! workspace. Returns id, referenceNum, and name. The release_reference (e.g. ZS-R-4) is required when creating features or epics.",
          inputSchema: {
            type: "object",
            properties: {
              workspaceId: { type: "string", description: "Workspace reference prefix (e.g., ZS)" },
              page: { type: "integer", description: "Page number for pagination", default: 1 },
            },
            required: ["workspaceId"],
          },
        },
        {
          name: "create_feature",
          description: "Create a new feature in Aha!. Use list_releases to find a valid release_reference. Optionally link to an epic and set workflow_status, assignee, tags, and due_date.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Feature name" },
              release_reference: { type: "string", description: "Release reference (e.g., ZS-R-4). Use list_releases to find valid values." },
              workspace_id: { type: "string", description: "Workspace prefix (e.g., ZS). Defaults to the prefix from release_reference." },
              epic_reference: { type: "string", description: "Optional epic to assign this feature to (e.g., ZS-E-28)" },
              description: { type: "string", description: "Feature description (markdown supported)" },
              workflow_status: { type: "string", description: "Workflow status name (e.g., 'Under consideration'). Use list_workflow_statuses to see valid values." },
              assigned_to_user_email: { type: "string", description: "Email address of the user to assign" },
              tag_list: { type: "string", description: "Comma-separated tags (e.g., 'backend,api')" },
              due_date: { type: "string", description: "Due date in YYYY-MM-DD format" },
            },
            required: ["name", "release_reference"],
          },
        },
        {
          name: "update_feature",
          description: "Update an existing Aha! feature. Only provide fields you want to change — unset fields are left unchanged.",
          inputSchema: {
            type: "object",
            properties: {
              reference: { type: "string", description: "Feature reference number (e.g., ZS-26)" },
              name: { type: "string", description: "New name" },
              description: { type: "string", description: "New description (markdown)" },
              workflow_status: { type: "string", description: "New workflow status name (e.g., 'In development')" },
              assigned_to_user_email: { type: "string", description: "Email of new assignee" },
              tag_list: { type: "string", description: "Comma-separated tags (replaces existing)" },
              due_date: { type: "string", description: "Due date in YYYY-MM-DD format" },
              epic_reference: { type: "string", description: "Epic to move this feature to (e.g., ZS-E-14)" },
            },
            required: ["reference"],
          },
        },
        {
          name: "delete_feature",
          description: "Permanently delete an Aha! feature. This is irreversible.",
          inputSchema: {
            type: "object",
            properties: {
              reference: { type: "string", description: "Feature reference number (e.g., ZS-26)" },
            },
            required: ["reference"],
          },
        },
        {
          name: "create_epic",
          description: "Create a new epic in Aha!. Use list_releases to find a valid release_reference.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Epic name" },
              release_reference: { type: "string", description: "Release reference (e.g., ZS-R-4). Use list_releases to find valid values." },
              description: { type: "string", description: "Epic description (markdown supported)" },
              workflow_status: { type: "string", description: "Workflow status name. Use list_workflow_statuses to see valid values." },
              assigned_to_user_email: { type: "string", description: "Email of the user to assign" },
              initiative_reference: { type: "string", description: "Initiative to link this epic to (e.g., ZS-S-4)" },
            },
            required: ["name", "release_reference"],
          },
        },
        {
          name: "update_epic",
          description: "Update an existing Aha! epic. Only provide fields you want to change.",
          inputSchema: {
            type: "object",
            properties: {
              reference: { type: "string", description: "Epic reference number (e.g., ZS-E-28)" },
              name: { type: "string", description: "New name" },
              description: { type: "string", description: "New description (markdown)" },
              workflow_status: { type: "string", description: "New workflow status name" },
              assigned_to_user_email: { type: "string", description: "Email of new assignee" },
              initiative_reference: { type: "string", description: "Initiative to link to (e.g., ZS-S-4)" },
            },
            required: ["reference"],
          },
        },
        {
          name: "delete_epic",
          description: "Permanently delete an Aha! epic. This is irreversible.",
          inputSchema: {
            type: "object",
            properties: {
              reference: { type: "string", description: "Epic reference number (e.g., ZS-E-28)" },
            },
            required: ["reference"],
          },
        },
        {
          name: "create_requirement",
          description: "Create a new requirement (sub-item) under an Aha! feature.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Requirement name" },
              feature_reference: { type: "string", description: "Parent feature reference (e.g., ZS-26)" },
              description: { type: "string", description: "Requirement description (markdown supported)" },
              workflow_status: { type: "string", description: "Workflow status name" },
              assigned_to_user_email: { type: "string", description: "Email of the user to assign" },
            },
            required: ["name", "feature_reference"],
          },
        },
        {
          name: "update_requirement",
          description: "Update an existing Aha! requirement. Only provide fields you want to change.",
          inputSchema: {
            type: "object",
            properties: {
              reference: { type: "string", description: "Requirement reference (e.g., ZS-26-1)" },
              name: { type: "string", description: "New name" },
              description: { type: "string", description: "New description (markdown)" },
              workflow_status: { type: "string", description: "New workflow status name" },
              assigned_to_user_email: { type: "string", description: "Email of new assignee" },
            },
            required: ["reference"],
          },
        },
        {
          name: "delete_requirement",
          description: "Permanently delete an Aha! requirement. This is irreversible.",
          inputSchema: {
            type: "object",
            properties: {
              reference: { type: "string", description: "Requirement reference (e.g., ZS-26-1)" },
            },
            required: ["reference"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === "get_record") {
        return this.handlers.handleGetRecord(request);
      } else if (request.params.name === "get_page") {
        return this.handlers.handleGetPage(request);
      } else if (request.params.name === "get_idea") {
        return this.handlers.handleGetIdea(request);
      } else if (request.params.name === "search_documents") {
        return this.handlers.handleSearchDocuments(request);
      } else if (request.params.name === "list_workspaces") {
        return this.handlers.handleListWorkspaces(request);
      } else if (request.params.name === "list_records") {
        return this.handlers.handleListRecords(request);
      } else if (request.params.name === "get_persona") {
        return this.handlers.handleGetPersona(request);
      } else if (request.params.name === "list_features_for_epic") {
        return this.handlers.handleListFeaturesForEpic(request);
      } else if (request.params.name === "list_workflow_statuses") {
        return this.handlers.handleListWorkflowStatuses(request);
      } else if (request.params.name === "get_initiative") {
        return this.handlers.handleGetInitiative(request);
      } else if (request.params.name === "list_releases") {
        return this.handlers.handleListReleases(request);
      } else if (request.params.name === "create_feature") {
        return this.handlers.handleCreateFeature(request);
      } else if (request.params.name === "update_feature") {
        return this.handlers.handleUpdateFeature(request);
      } else if (request.params.name === "delete_feature") {
        return this.handlers.handleDeleteFeature(request);
      } else if (request.params.name === "create_epic") {
        return this.handlers.handleCreateEpic(request);
      } else if (request.params.name === "update_epic") {
        return this.handlers.handleUpdateEpic(request);
      } else if (request.params.name === "delete_epic") {
        return this.handlers.handleDeleteEpic(request);
      } else if (request.params.name === "create_requirement") {
        return this.handlers.handleCreateRequirement(request);
      } else if (request.params.name === "update_requirement") {
        return this.handlers.handleUpdateRequirement(request);
      } else if (request.params.name === "delete_requirement") {
        return this.handlers.handleDeleteRequirement(request);
      }

      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Aha! MCP server running on stdio");
  }
}

const server = new AhaMcp();
server.run().catch(console.error);
