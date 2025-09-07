import * as path from "path";
export class DocumentConverter {
    config;
    supportedFormats = {
        input: ["docx", "pdf", "html", "txt", "md"],
        output: ["html", "txt", "md"]
    };
    constructor(config) {
        this.config = config || {};
    }
    /**
     * 转换文档格式
     */
    async convertDocument(request) {
        const { sourceFormat, targetFormat, content, filename } = request;
        // 验证格式支持
        if (!this.supportedFormats.input.includes(sourceFormat)) {
            throw new Error(`不支持的源格式: ${sourceFormat}`);
        }
        if (!this.supportedFormats.output.includes(targetFormat)) {
            throw new Error(`不支持的目标格式: ${targetFormat}`);
        }
        // 如果源格式和目标格式相同，直接返回
        if (sourceFormat === targetFormat) {
            return {
                content,
                filename: this.changeFileExtension(filename, targetFormat),
                format: targetFormat
            };
        }
        try {
            // 第一步：将源格式转换为中间格式（HTML或纯文本）
            let intermediateContent;
            let intermediateFormat;
            switch (sourceFormat) {
                case "docx":
                    intermediateContent = await this.convertDocxToHtml(content);
                    intermediateFormat = "html";
                    break;
                case "pdf":
                    intermediateContent = await this.convertPdfToText(content);
                    intermediateFormat = "txt";
                    break;
                case "html":
                    intermediateContent = content;
                    intermediateFormat = "html";
                    break;
                case "txt":
                    intermediateContent = content;
                    intermediateFormat = "txt";
                    break;
                case "md":
                    intermediateContent = await this.convertMarkdownToHtml(content);
                    intermediateFormat = "html";
                    break;
                default:
                    throw new Error(`不支持的源格式: ${sourceFormat}`);
            }
            // 第二步：将中间格式转换为目标格式
            let finalContent;
            switch (targetFormat) {
                case "html":
                    if (intermediateFormat === "html") {
                        finalContent = intermediateContent;
                    }
                    else {
                        // 将纯文本转换为HTML
                        finalContent = this.convertTextToHtml(intermediateContent);
                    }
                    break;
                case "txt":
                    if (intermediateFormat === "txt") {
                        finalContent = intermediateContent;
                    }
                    else {
                        // 将HTML转换为纯文本
                        finalContent = await this.convertHtmlToText(intermediateContent);
                    }
                    break;
                case "md":
                    if (intermediateFormat === "html") {
                        finalContent = await this.convertHtmlToMarkdown(intermediateContent);
                    }
                    else {
                        // 将纯文本转换为Markdown
                        finalContent = this.convertTextToMarkdown(intermediateContent);
                    }
                    break;
                default:
                    throw new Error(`不支持的目标格式: ${targetFormat}`);
            }
            return {
                content: finalContent,
                filename: this.changeFileExtension(filename, targetFormat),
                format: targetFormat
            };
        }
        catch (error) {
            throw new Error(`文档转换失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 检测文档格式
     */
    async detectFormat(content, filename) {
        // 首先尝试从文件名检测
        if (filename) {
            const ext = path.extname(filename).toLowerCase().slice(1);
            if (this.supportedFormats.input.includes(ext)) {
                return ext;
            }
        }
        // 尝试从内容检测
        try {
            // 检查是否为base64编码的二进制文件
            if (this.isBase64(content)) {
                const buffer = Buffer.from(content, 'base64');
                // 检查PDF魔数
                if (buffer.slice(0, 4).toString() === '%PDF') {
                    return 'pdf';
                }
                // 检查DOCX魔数（ZIP文件格式）
                if (buffer.slice(0, 2).toString('hex') === '504b') {
                    return 'docx';
                }
            }
            // 检查HTML
            if (content.trim().startsWith('<') && content.includes('</')) {
                return 'html';
            }
            // 检查Markdown
            if (content.includes('#') || content.includes('**') || content.includes('*') || content.includes('[') && content.includes('](')) {
                return 'md';
            }
            // 默认为纯文本
            return 'txt';
        }
        catch (error) {
            return 'txt'; // 默认返回纯文本格式
        }
    }
    /**
     * 获取支持的格式
     */
    getSupportedFormats() {
        return this.supportedFormats;
    }
    // 私有方法：格式转换实现
    async convertDocxToHtml(base64Content) {
        try {
            const mammoth = await import('mammoth');
            const buffer = Buffer.from(base64Content, 'base64');
            const result = await mammoth.default.convertToHtml({ buffer });
            return result.value;
        }
        catch (error) {
            throw new Error(`DOCX转换失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async convertPdfToText(base64Content) {
        try {
            const buffer = Buffer.from(base64Content, 'base64');
            const pdfParse = (await import('pdf-parse')).default;
            const data = await pdfParse(buffer);
            return data.text;
        }
        catch (error) {
            throw new Error(`PDF转换失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async convertMarkdownToHtml(markdownContent) {
        try {
            const { marked } = await import('marked');
            return await marked(markdownContent);
        }
        catch (error) {
            throw new Error(`Markdown转换失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async convertHtmlToText(htmlContent) {
        try {
            const { htmlToText } = await import('html-to-text');
            return htmlToText(htmlContent, {
                wordwrap: false,
                preserveNewlines: true,
                selectors: [
                    { selector: 'img', options: { ignoreHref: true } },
                    { selector: 'a', options: { ignoreHref: true } }
                ]
            });
        }
        catch (error) {
            throw new Error(`HTML转文本失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    convertTextToHtml(textContent) {
        // 将纯文本转换为HTML，保持换行和段落结构
        const lines = textContent.split('\n');
        const htmlLines = lines.map(line => {
            if (line.trim() === '') {
                return '<br>';
            }
            return `<p>${this.escapeHtml(line)}</p>`;
        });
        return htmlLines.join('\n');
    }
    async convertHtmlToMarkdown(htmlContent) {
        try {
            const { JSDOM } = await import('jsdom');
            const dom = new JSDOM(htmlContent);
            const document = dom.window.document;
            let markdown = '';
            // 简单的HTML到Markdown转换
            const processNode = (node) => {
                if (node.nodeType === 3) { // 文本节点
                    return node.textContent || '';
                }
                if (node.nodeType === 1) { // 元素节点
                    const tagName = node.tagName.toLowerCase();
                    const children = Array.from(node.childNodes).map(processNode).join('');
                    switch (tagName) {
                        case 'h1': return `# ${children}\n\n`;
                        case 'h2': return `## ${children}\n\n`;
                        case 'h3': return `### ${children}\n\n`;
                        case 'h4': return `#### ${children}\n\n`;
                        case 'h5': return `##### ${children}\n\n`;
                        case 'h6': return `###### ${children}\n\n`;
                        case 'p': return `${children}\n\n`;
                        case 'strong':
                        case 'b': return `**${children}**`;
                        case 'em':
                        case 'i': return `*${children}*`;
                        case 'code': return `\`${children}\``;
                        case 'pre': return `\`\`\`\n${children}\n\`\`\`\n\n`;
                        case 'a':
                            const href = node.getAttribute('href');
                            return href ? `[${children}](${href})` : children;
                        case 'img':
                            const src = node.getAttribute('src');
                            const alt = node.getAttribute('alt') || '';
                            return src ? `![${alt}](${src})` : '';
                        case 'ul':
                        case 'ol': return `${children}\n`;
                        case 'li': return `- ${children}\n`;
                        case 'br': return '\n';
                        default: return children;
                    }
                }
                return '';
            };
            return processNode(document.body).trim();
        }
        catch (error) {
            throw new Error(`HTML转Markdown失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    convertTextToMarkdown(textContent) {
        // 将纯文本转换为Markdown，尝试识别标题和段落
        const lines = textContent.split('\n');
        const markdownLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') {
                markdownLines.push('');
                continue;
            }
            // 尝试识别标题（全大写或以数字开头的行）
            if (line === line.toUpperCase() && line.length < 100) {
                markdownLines.push(`## ${line}`);
                markdownLines.push('');
            }
            else if (/^\d+\./.test(line)) {
                markdownLines.push(`### ${line}`);
                markdownLines.push('');
            }
            else {
                markdownLines.push(line);
                markdownLines.push('');
            }
        }
        return markdownLines.join('\n').trim();
    }
    // 辅助方法
    isBase64(str) {
        try {
            return Buffer.from(str, 'base64').toString('base64') === str;
        }
        catch (error) {
            return false;
        }
    }
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
    changeFileExtension(filename, newExtension) {
        const baseName = path.basename(filename, path.extname(filename));
        return `${baseName}.${newExtension}`;
    }
}
//# sourceMappingURL=document-converter.js.map