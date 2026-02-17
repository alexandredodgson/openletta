/**
 * Type declarations for @letta-ai/letta-client
 * Minimal declarations for the Letta SDK
 */

declare module '@letta-ai/letta-client' {
  export class Letta {
    constructor(options: { apiKey: string });
    agents: {
      list: () => Promise<Array<{ id: string; name: string }>>;
      create: (options: { name: string }) => Promise<{ id: string; name: string }>;
      retrieve: (agentId: string) => Promise<any>;
      update: (agentId: string, options: any) => Promise<any>;
      tools: {
        updateApproval: (toolName: string, options: any) => Promise<any>;
      };
      messages: {
        list: (agentId: string, params?: any) => Promise<any[]>;
        create: (agentId: string, options: any) => Promise<any>;
        stream: (agentId: string) => Promise<AsyncIterable<any>>;
      };
    };
    groups?: {
      list?: () => Promise<any[]>;
      create?: (options: any) => Promise<any>;
    };
    message?: {
      send?: (agentId: string, text: string) => Promise<any>;
    };
  }
}
