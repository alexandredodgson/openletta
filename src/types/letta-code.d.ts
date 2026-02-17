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
    };
    messages?: {
      create?: (agentId: string, options: unknown) => Promise<unknown>;
      stream?: (agentId: string) => Promise<AsyncIterable<unknown>>;
    };
    message?: {
      send?: (agentId: string, text: string) => Promise<unknown>;
      stream?: (agentId: string) => Promise<AsyncIterable<unknown>>;
    };
    stream?: (agentId: string, conversationId: string) => Promise<AsyncIterable<unknown>>;
  }
}
