import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools.js";

const server = new McpServer({
  name: "universal-clipboard-bridge",
  version: "0.1.0",
});

registerTools(server);

const transport = new StdioServerTransport();
server.connect(transport);

console.log("Universal Clipboard Bridge MCP Server is running.");

export { server };
