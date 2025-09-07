declare module 'mammoth' {
  export interface ConvertToHtmlOptions {
    buffer?: Buffer;
    path?: string;
  }
  
  export interface ConvertToHtmlResult {
    value: string;
    messages: any[];
  }
  
  export function convertToHtml(options: ConvertToHtmlOptions): Promise<ConvertToHtmlResult>;
}

declare module 'marked' {
  export function marked(markdown: string): Promise<string>;
}

declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }
  
  function pdfParse(buffer: Buffer): Promise<PDFData>;
  export = pdfParse;
}