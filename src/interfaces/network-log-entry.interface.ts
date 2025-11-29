/**
 * Represents a single network log entry captured during script execution
 */
export interface NetworkLogEntry {
    /** ISO timestamp when the request was captured */
    timestamp: string;
    /** Full URL of the request */
    url: string;
    /** HTTP method (GET, POST, etc.) */
    method: string;
    /** Request headers */
    requestHeaders: Record<string, string>;
    /** POST data if applicable */
    requestPostData?: string | null;
    /** HTTP response status code */
    responseStatus: number;
    /** Response headers */
    responseHeaders: Record<string, string>;
    /** Parsed response body (JSON or string) */
    responseBody: any;
}
