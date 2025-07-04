import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { convertContent } from "./conversion.js";
import { detectFormat, listFormats } from "./formats.js";
import { ConversionRequest, Format } from "./types.js";

export function registerTools(server: McpServer) {
  server.registerTool(
    "convert_content",
    {
      title: "Convert Content",
      description: "Transforms content from a source format to a target format.",
      inputSchema: {
        content: z.string(),
        sourceFormat: z.nativeEnum(Format).optional(),
        targetFormat: z.nativeEnum(Format),
        options: z.object({}).optional(),
      },
    },
    async (request: ConversionRequest) => {
      const result = await convertContent(request);
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.registerTool(
    "detect_format",
    {
      title: "Detect Format",
      description: "Identifies the format of a given piece of content.",
      inputSchema: { content: z.string() },
    },
    async ({ content }: { content: string }) => {
      const format = detectFormat(content);
      return { content: [{ type: "text", text: format }] };
    }
  );

  server.registerTool(
    "list_supported_formats",
    {
      title: "List Supported Formats",
      description: "Lists all supported content formats for conversion.",
      inputSchema: {},
    },
    async () => {
      const formats = listFormats();
      return { content: [{ type: "text", text: JSON.stringify(formats) }] };
    }
  );

  server.registerTool(
    "preview_conversion",
    {
      title: "Preview Conversion",
      description: "Shows a preview of how content will look after conversion without saving.",
      inputSchema: {
        content: z.string(),
        sourceFormat: z.nativeEnum(Format).optional(),
        targetFormat: z.nativeEnum(Format),
        options: z.object({}).optional(),
      },
    },
    async (request: ConversionRequest) => {
      const result = await convertContent(request);
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.registerTool(
    "convert_batch",
    {
      title: "Convert Batch",
      description: "Processes multiple conversion requests in a single call.",
      inputSchema: {
        requests: z.array(
          z.object({
            content: z.string(),
            sourceFormat: z.nativeEnum(Format).optional(),
            targetFormat: z.nativeEnum(Format),
            options: z.object({}).optional(),
          })
        ),
      },
    },
    async ({ requests }: { requests: ConversionRequest[] }) => {
      const results = await Promise.all(requests.map((r) => convertContent(r)));
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );
}
