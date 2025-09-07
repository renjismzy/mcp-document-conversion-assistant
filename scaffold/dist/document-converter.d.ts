export interface ConversionRequest {
    sourceFormat: string;
    targetFormat: string;
    content: string;
    filename: string;
}
export interface ConversionResult {
    content: string;
    filename: string;
    format: string;
}
export declare class DocumentConverter {
    private config;
    private supportedFormats;
    constructor(config?: any);
    /**
     * 转换文档格式
     */
    convertDocument(request: ConversionRequest): Promise<ConversionResult>;
    /**
     * 检测文档格式
     */
    detectFormat(content: string, filename?: string): Promise<string>;
    /**
     * 获取支持的格式
     */
    getSupportedFormats(): {
        input: string[];
        output: string[];
    };
    private convertDocxToHtml;
    private convertPdfToText;
    private convertMarkdownToHtml;
    private convertHtmlToText;
    private convertTextToHtml;
    private convertHtmlToMarkdown;
    private convertTextToMarkdown;
    private isBase64;
    private escapeHtml;
    private changeFileExtension;
}
//# sourceMappingURL=document-converter.d.ts.map