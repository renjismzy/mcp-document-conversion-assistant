# Document Conversion Assistant

一个基于模型上下文协议 (MCP) 的文档转换服务器，提供强大的文档格式转换功能。

## 功能特性

- 🔄 支持多种文档格式之间的转换
- 📄 保持文档内容的保真度
- 🔍 自动检测文档格式
- 📚 支持常见的文档类型
- ⚡ 高性能的转换引擎

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd document-conversion-assistant

# 安装依赖
npm install

# 构建项目
npm run build
```

## 使用方法

### 启动 MCP 服务器

```bash
node dist/index.js
```

服务器启动后，将通过标准输入/输出与 MCP 客户端进行通信。

### 在 Claude Desktop 中使用

1. 在 Claude Desktop 的配置文件中添加此 MCP 服务器
2. 重启 Claude Desktop
3. 现在可以使用文档转换功能

## 支持的格式

| 格式 | 扩展名 | 读取 | 写入 | 说明 |
|------|--------|------|------|------|
| Markdown | `.md` | ✅ | ✅ | 支持完整的 Markdown 语法 |
| HTML | `.html`, `.htm` | ✅ | ✅ | 标准 HTML 格式 |
| 纯文本 | `.txt` | ✅ | ✅ | UTF-8 编码的文本文件 |
| PDF | `.pdf` | ✅ | ❌ | 提取文本内容 |
| Word 文档 | `.docx` | ✅ | ❌ | Microsoft Word 格式 |

## 可用工具

### convert_document

将文档从一种格式转换为另一种格式。

**参数：**
- `sourceFormat`: 源文档格式 (markdown, html, txt, pdf, docx)
- `targetFormat`: 目标格式 (markdown, html, txt)
- `content`: 文档内容 (字符串或 Base64 编码)
- `filename`: 文件名 (可选)

**示例：**
```json
{
  "sourceFormat": "markdown",
  "targetFormat": "html",
  "content": "# Hello World\n\nThis is a test.",
  "filename": "test.md"
}
```

### detect_document_format

检测给定文档的格式。

**参数：**
- `content`: 文档内容
- `filename`: 文件名 (可选，用于辅助检测)

**返回：**
- 检测到的文档格式

### get_supported_formats

获取所有支持的文档格式列表。

**返回：**
- 支持的格式数组，包含格式名称和描述

## 技术架构

### 核心依赖

- **@modelcontextprotocol/sdk**: MCP 协议实现
- **mammoth**: Word 文档处理
- **pdf-parse**: PDF 文档解析
- **marked**: Markdown 到 HTML 转换
- **jsdom**: HTML 处理
- **html-to-text**: HTML 到文本转换
- **zod**: 数据验证

### 项目结构

```
src/
├── index.ts              # MCP 服务器主入口
├── document-converter.ts  # 文档转换核心逻辑
└── types.d.ts            # TypeScript 类型声明
```

## 开发

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build

# 运行
node dist/index.js
```

### 测试

项目包含测试文档 `test.md`，可用于验证转换功能。

### 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 Markdown、HTML、TXT、PDF、DOCX 格式
- 实现文档格式自动检测
- 提供完整的 MCP 工具集

## 常见问题

### Q: 如何在 Claude Desktop 中配置？

A: 在 Claude Desktop 的配置文件中添加以下配置：

```json
{
  "mcpServers": {
    "document-converter": {
      "command": "node",
      "args": ["/path/to/document-conversion-assistant/dist/index.js"]
    }
  }
}
```

### Q: 支持哪些 PDF 类型？

A: 目前支持基于文本的 PDF 文件。扫描版 PDF（图像）需要 OCR 处理，暂不支持。

### Q: 转换大文件时性能如何？

A: 转换性能取决于文件大小和复杂度。建议单个文件不超过 10MB。
