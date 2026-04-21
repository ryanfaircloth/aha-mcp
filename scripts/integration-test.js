#!/usr/bin/env node
/**
 * Integration smoke test — sends real MCP JSON-RPC messages to the server
 * and checks responses for expected structure.
 *
 * Usage:
 *   op run --env-file ~/.config/aha-mcp.env -- npm run test:integration
 *
 * Set TEST_WORKSPACE (e.g. "ZS") and optionally TEST_EPIC_REF (e.g. "ZS-E-28"),
 * TEST_FEATURE_REF, TEST_PAGE_REF in the env file or environment.
 */

import { spawn } from "child_process";

const WORKSPACE = process.env.TEST_WORKSPACE;
if (!WORKSPACE) {
  console.error("TEST_WORKSPACE env var is required (e.g. TEST_WORKSPACE=ZS)");
  process.exit(1);
}

const serverPath = new URL("../build/index.js", import.meta.url).pathname;

let msgId = 0;
function makeRequest(method, params = {}) {
  return JSON.stringify({ jsonrpc: "2.0", id: ++msgId, method, params }) + "\n";
}

function callTool(name, args) {
  return makeRequest("tools/call", { name, arguments: args });
}

const server = spawn("node", [serverPath], {
  env: process.env,
  stdio: ["pipe", "pipe", "inherit"],
});

let buffer = "";
const results = [];
let initialized = false;
const queue = [];

server.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    results.push(msg);
    if (!initialized && msg.id === 1) {
      initialized = true;
      drainQueue();
    } else if (msg.id > 1) {
      drainQueue();
    }
  }
});

function drainQueue() {
  const next = queue.shift();
  if (next) server.stdin.write(next);
}

// Initialize
server.stdin.write(
  makeRequest("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "integration-test", version: "1.0.0" },
  })
);
server.stdin.write(makeRequest("notifications/initialized"));

// Queue test calls
const tests = [
  { name: "list_workspaces", args: {} },
  { name: "list_records", args: { workspaceId: WORKSPACE, type: "epic" } },
  { name: "list_records", args: { workspaceId: WORKSPACE, type: "feature" } },
  { name: "list_records", args: { workspaceId: WORKSPACE, type: "initiative" } },
  { name: "list_records", args: { workspaceId: WORKSPACE, type: "goal" } },
];

if (process.env.TEST_EPIC_REF) {
  tests.push({ name: "get_record", args: { reference: process.env.TEST_EPIC_REF } });
}
if (process.env.TEST_FEATURE_REF) {
  tests.push({ name: "get_record", args: { reference: process.env.TEST_FEATURE_REF } });
}
if (process.env.TEST_PAGE_REF) {
  tests.push({ name: "get_page", args: { reference: process.env.TEST_PAGE_REF } });
}

for (const t of tests) {
  queue.push(callTool(t.name, t.args));
}

// Wait for all responses then report
setTimeout(() => {
  server.stdin.end();
  server.kill();

  let passed = 0;
  let failed = 0;

  // id=1 is initialize, id=2 onward are tool calls
  const toolResponses = results.filter((r) => r.id >= 2);

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const response = toolResponses[i];
    const label = `${test.name}(${JSON.stringify(test.args)})`;

    if (!response) {
      console.error(`FAIL  ${label} — no response received`);
      failed++;
      continue;
    }

    if (response.error) {
      console.error(`FAIL  ${label} — ${response.error.message}`);
      failed++;
    } else {
      const text = response.result?.content?.[0]?.text;
      if (!text) {
        console.error(`FAIL  ${label} — empty response content`);
        failed++;
      } else {
        try {
          JSON.parse(text);
          console.log(`PASS  ${label}`);
          passed++;
        } catch {
          console.error(`FAIL  ${label} — response not valid JSON`);
          failed++;
        }
      }
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}, 10000);
