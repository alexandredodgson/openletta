/**
 * useStream.ts — React hook to consume a Letta stream and update state.
 *
 * Responsibilities:
 * - Take a session's stream() async iterator
 * - Accumulate all message types (reasoning, assistant, tool_call, etc.)
 * - Extract and structure messages by type
 * - Return structured messages for UI rendering
 *
 * Usage in App.tsx:
 * ```tsx
 * const { streamContent, messages, isStreaming, startStream } = useStream();
 *
 * const handleSubmit = async (text: string) => {
 *   await session.send(text);
 *   const result = await startStream(session.stream());
 *   // result contains all messages with reasoning, tools, etc.
 * };
 * ```
 *
 * Phase 2 changes:
 * - Now captures all 6 message types from Letta stream
 * - Returns structured data (assistantContent, reasoning[], toolCalls[], toolReturns[])
 * - Maintains backward compatibility (streamContent still available)
 */

import { useState, useRef } from 'react';
import type {
  LettaMessage,
  ReasoningMessage,
  AssistantMessage,
  ToolCallMessage,
  ToolReturnMessage,
  DisplayMessage,
} from '../types/letta';

interface StreamState {
  assistantContent: string;
  reasoning: string[];
  toolCalls: ToolCallMessage[];
  toolReturns: ToolReturnMessage[];
}

export function useStream() {
  const [streamContent, setStreamContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<StreamState>({
    assistantContent: '',
    reasoning: [],
    toolCalls: [],
    toolReturns: [],
  });
  const abortRef = useRef(false);

  const startStream = async (stream: AsyncIterable<LettaMessage>): Promise<DisplayMessage> => {
    abortRef.current = false;
    setIsStreaming(true);
    setStreamContent('');
    const state: StreamState = {
      assistantContent: '',
      reasoning: [],
      toolCalls: [],
      toolReturns: [],
    };

    try {
      for await (const msg of stream) {
        if (abortRef.current) break;

        // Dispatch by message type
        if (msg.message_type === 'assistant_message') {
          const aMsg = msg as AssistantMessage;
          state.assistantContent += aMsg.content;
          setStreamContent(state.assistantContent);
        } else if (msg.message_type === 'reasoning_message') {
          const rMsg = msg as ReasoningMessage;
          state.reasoning.push(rMsg.content);
        } else if (msg.message_type === 'approval_request_message') {
          // Tool call request - extract the tool_call details
          const toolMsg = (msg as any).tool_call as ToolCallMessage;
          state.toolCalls.push(toolMsg);
        } else if (msg.message_type === 'tool_return_message' || 'tool_return' in msg) {
          // Tool return (when tool execution completes)
          const tMsg = msg as any as ToolReturnMessage;
          state.toolReturns.push(tMsg);
        }
        // Silently ignore other message types (user_message, usage_statistics, etc.)
      }
    } catch (error) {
      setIsStreaming(false);
      throw error;
    }

    setMessages(state);
    setIsStreaming(false);

    // Return structured display message
    return {
      role: 'assistant',
      content: state.assistantContent,
      reasoning: state.reasoning.length > 0 ? state.reasoning : undefined,
      toolCalls: state.toolCalls.length > 0 ? state.toolCalls : undefined,
      toolReturns: state.toolReturns.length > 0 ? state.toolReturns : undefined,
    };
  };

  const abortStream = () => {
    abortRef.current = true;
    setIsStreaming(false);
  };

  const clearStream = () => {
    setStreamContent('');
    setMessages({
      assistantContent: '',
      reasoning: [],
      toolCalls: [],
      toolReturns: [],
    });
  };

  return {
    streamContent,
    isStreaming,
    messages,
    startStream,
    abortStream,
    clearStream,
  };
}
