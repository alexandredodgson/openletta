/**
 * letta.ts — TypeScript type definitions for Letta messages
 */

/**
 * Agent metadata
 */
export interface Agent {
  id: string;
  name: string;
}

/**
 * Conversation (Group of messages)
 */
export interface Conversation {
  id: string;
  name?: string;
}

/**
 * Tool call details with execution metadata
 */
export interface ToolCallMessage {
  tool_call_id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  isBlocked?: boolean; // Phase 3: Flag for restricted tools in Plan mode
  blockReason?: string; // Phase 3: Reason for blocking
}

/**
 * Tool execution result with status and output
 */
export interface ToolReturnMessage {
  message_type: 'tool_return_message';
  tool_call_id: string;
  tool_name: string;
  status: 'success' | 'error';
  result: string;
}

/**
 * User message sent to the agent
 */
export interface UserMessage {
  message_type: 'user_message';
  content: string;
  timestamp?: string;
}

/**
 * Agent reasoning message (internal thoughts)
 */
export interface ReasoningMessage {
  message_type: 'reasoning_message';
  content: string;
  timestamp?: string;
}

/**
 * Assistant response message
 */
export interface AssistantMessage {
  message_type: 'assistant_message';
  content: string;
  timestamp?: string;
}

/**
 * Tool execution request requiring approval
 */
export interface ApprovalRequestMessage {
  message_type: 'approval_request_message';
  tool_call: ToolCallMessage;
  timestamp?: string;
}

/**
 * Usage statistics for the interaction
 */
export interface UsageStatistics {
  message_type: 'usage_statistics';
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
}

/**
 * Union type of all message variants
 */
export type LettaMessage =
  | UserMessage
  | ReasoningMessage
  | AssistantMessage
  | ApprovalRequestMessage
  | ToolReturnMessage
  | UsageStatistics;

/**
 * Display message used in UI (aggregates multiple stream messages)
 */
export interface DisplayMessage {
  role: 'user' | 'assistant' | 'system';
  content?: string;
  reasoning?: string[];
  toolCalls?: ToolCallMessage[];
  toolReturns?: ToolReturnMessage[];
  timestamp?: string;
}

/**
 * Session wrapper maintaining backward compatibility
 */
export interface LettaSessionWrapper {
  agentId: string;
  conversationId: string;
  send: (text: string, mode?: AppMode) => Promise<void>;
  updateMode: (mode: AppMode) => Promise<void>;
  stream: (mode?: AppMode) => AsyncIterable<LettaMessage>;
  listAgents: () => Promise<Agent[]>;
  listConversations: (agentId: string) => Promise<Conversation[]>;
  getHistory: (agentId: string, conversationId?: string) => Promise<LettaMessage[]>;
  close: () => Promise<void>;
}

/**
 * Application working modes
 * - plan: Read-only mode (Plan)
 * - build: Full access mode (Build)
 */
export type AppMode = 'plan' | 'build';
