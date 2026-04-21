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
          description: "Get an Aha! feature or requirement by reference number",
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
          description: "Search for Aha! documents",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query string",
              },
              searchableType: {
                type: "string",
                description: "Type of document to search for (e.g., Page)",
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
                enum: ["feature", "epic", "initiative", "goal", "idea"],
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
