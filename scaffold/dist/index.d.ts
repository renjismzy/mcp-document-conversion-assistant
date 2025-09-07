import { z } from "zod";
export declare const configSchema: z.ZodObject<{
    debug: z.ZodDefault<z.ZodBoolean>;
    maxFileSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    debug: boolean;
    maxFileSize: number;
}, {
    debug?: boolean | undefined;
    maxFileSize?: number | undefined;
}>;
export default function createServer({ config }: {
    config?: z.infer<typeof configSchema>;
}): import("@modelcontextprotocol/sdk/server/index.js").Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>;
//# sourceMappingURL=index.d.ts.map