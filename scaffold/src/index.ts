import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DocumentConverter } from "./document-converter.js";

// 配置模式
export const configSchema = z.object({
  debug: z.boolean().default(false).describe("启用调试日志"),
  maxFileSize: z.number().default(10 * 1024 * 1024).describe("最大文件大小（字节）"),
});

export default function createServer({ config }: { config?: z.infer<typeof configSchema> }) {
  const server = new McpServer({
    name: "Document Conversion Assistant",
    version: "1.0.0",
  });

  const converter = new DocumentConverter(config);

  // 注册文档转换工具
  server.registerTool(
    "convert_document",
    {
      description: "将文档从一种格式转换为另一种格式，保持内容完整性",
      inputSchema: {
        sourceFormat: z.enum(["docx", "pdf", "html", "txt", "md"]).describe("源文档格式"),
        targetFormat: z.enum(["docx", "pdf", "html", "txt", "md"]).describe("目标文档格式"),
        content: z.string().describe("文档内容（base64编码或纯文本）"),
        filename: z.string().describe("文件名")
      },
    },
    async ({ sourceFormat, targetFormat, content, filename }) => {
      try {
        const result = await converter.convertDocument({
          sourceFormat,
          targetFormat,
          content,
          filename
        });
        
        return {
          content: [
            {
              type: "text",
              text: `文档转换成功！\n原格式: ${sourceFormat}\n目标格式: ${targetFormat}\n文件名: ${result.filename}\n内容长度: ${result.content.length} 字符`
            }
          ],
          isError: false
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `文档转换失败: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // 注册文档格式检测工具
  server.registerTool(
    "detect_document_format",
    {
      description: "检测文档的格式类型",
      inputSchema: {
        content: z.string().describe("文档内容（base64编码或纯文本）"),
        filename: z.string().optional().describe("文件名（可选）")
      },
    },
    async ({ content, filename }) => {
      try {
        const format = await converter.detectFormat(content, filename);
        
        return {
          content: [
            {
              type: "text",
              text: `检测到的文档格式: ${format}`
            }
          ],
          isError: false
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `格式检测失败: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // 注册支持格式查询工具
  server.registerTool(
    "get_supported_formats",
    {
      description: "获取所有支持的文档格式列表",
      inputSchema: {},
    },
    async () => {
      const formats = converter.getSupportedFormats();
      
      return {
        content: [
          {
            type: "text",
            text: `支持的文档格式:\n输入格式: ${formats.input.join(", ")}\n输出格式: ${formats.output.join(", ")}`
          }
        ],
        isError: false
      };
    }
  );

  return server.server;
}

// 启动服务器
const server = createServer({});
const transport = new StdioServerTransport();
server.connect(transport);

console.error('Document Conversion Assistant MCP Server started');

// 保持进程运行
process.on('SIGINT', () => {
  console.error('Server shutting down...');
  process.exit(0);
});