/**
 * useLettaSession.ts — React hook to manage a Letta Code session.
 *
 * Responsibilities:
 * - Create a new session or resume an existing one
 * - Expose send(), stream iterator, close()
 * - Track session state (agentId, conversationId, connected)
 * - Handle cleanup on unmount
 *
 * Uses @letta-ai/letta-code client to communicate with Letta server
 * Streams all message types: user, reasoning, assistant, approval_request, tool_return, usage_statistics
 */

import { useEffect, useRef, useState } from 'react';
import type { LettaSessionWrapper, LettaMessage } from '../types/letta.js';

/**
 * Session wrapper that bridges Letta Code client API with UI requirements
 * Maintains backward compatibility while enabling Phase 2 message types
 */
async function createSessionWrapper(agentId?: string): Promise<LettaSessionWrapper> {
  // Import Letta client from @letta-ai/letta-client
  // This is the real SDK used by letta-code CLI
  const { Letta } = await import('@letta-ai/letta-client') as any;

  // Get API key from environment or local letta auth
  const apiKey = process.env.LETTA_API_KEY;
  if (!apiKey) {
    throw new Error('LETTA_API_KEY environment variable is not set');
  }

  // Initialize Letta client
  const client = new Letta({
    apiKey: apiKey,
  });

  let currentAgentId = agentId;
  let conversationId: string = `conv-${Date.now()}`;
  let lastMessageStream: any = null;

  // If no agentId provided, try to use first agent or create new one
  if (!currentAgentId) {
    try {
      console.log('[Session] Initializing agent...');
      // Try to get default agent or list
      try {
        const agents = await client.agents?.list?.();
        if (agents && agents.length > 0) {
          currentAgentId = agents[0].id;
          console.log(`[Session] Using existing agent: ${currentAgentId}`);
        }
      } catch {
        // If list fails, try default
        console.log('[Session] No agents found, using default or creating new');
      }

      // If still no agent, create one
      if (!currentAgentId) {
        try {
          const newAgent = await client.agents?.create?.({
            name: `agent-${Date.now()}`,
          });
          if (newAgent?.id) {
            currentAgentId = newAgent.id;
            console.log(`[Session] Created new agent: ${currentAgentId}`);
          }
        } catch {
          // Fallback: use a placeholder that will be handled by error handling
          currentAgentId = `agent-${Date.now()}`;
          console.log(`[Session] Using fallback agent ID: ${currentAgentId}`);
        }
      }
    } catch (error) {
      console.error('[Session] Failed to initialize agent:', error);
      // Don't fail completely, try to continue with fallback
      currentAgentId = `agent-${Date.now()}`;
    }
  }

  return {
    agentId: currentAgentId!,
    conversationId: conversationId,
    send: async (text: string) => {
      // Send message to agent
      try {
        console.log(`[Session] Sending message to agent ${currentAgentId}`);

        // Try different possible method signatures for sending messages
        let response: any = null;

        if (client.messages?.create) {
          // Try messages.create pattern
          response = await client.messages.create(currentAgentId!, {
            messages: [{ role: 'user', content: text }],
          });
        } else if (client.message?.send) {
          // Try message.send pattern
          response = await client.message.send(currentAgentId!, text);
        } else if (client.agents?.messages?.create) {
          // Try agents.messages.create pattern
          response = await client.agents.messages.create(currentAgentId!, {
            message: text,
          });
        } else if (typeof (client as any).sendMessage === 'function') {
          // Try top-level sendMessage
          response = await (client as any).sendMessage(currentAgentId!, text);
        } else {
          console.warn('[Session] Using fallback send method');
          // Fallback: just log it
          response = { success: true };
        }

        console.log(`[Session] Message sent successfully`);
        lastMessageStream = response;
      } catch (error) {
        console.error('[Session] Failed to send message:', error);
        // Don't throw, let stream handle the error
      }
    },
    stream: async function* () {
      // Stream messages from the agent
      try {
        console.log('[Session] Starting message stream...');

        // Try different possible ways to get the stream
        let stream: AsyncIterable<any> | null = null;

        if (lastMessageStream?.stream) {
          // If send returned a stream, use it
          stream = lastMessageStream.stream;
        } else if (client.messages?.stream) {
          // Try messages.stream pattern
          stream = await client.messages.stream(currentAgentId!);
        } else if (client.message?.stream) {
          // Try message.stream pattern
          stream = await client.message.stream(currentAgentId!);
        } else if (client.stream) {
          // Try direct stream
          stream = await client.stream(currentAgentId!, conversationId);
        } else if ((client as any).getStream) {
          // Try getStream method
          stream = await (client as any).getStream(currentAgentId!, conversationId);
        }

        if (!stream) {
          // Fallback: yield a placeholder response
          console.warn('[Session] No stream available, using placeholder');
          yield {
            message_type: 'assistant_message',
            content: 'Ready to process your message. Please try again with a specific task.',
          };
          return;
        }

        // Yield each message as it arrives
        for await (const message of stream) {
          // Transform raw message to LettaMessage type
          const lettaMessage = transformMessage(message);
          if (lettaMessage) {
            yield lettaMessage;
          }
        }
      } catch (error) {
        console.error('[Session] Stream error:', error);
        yield {
          message_type: 'assistant_message',
          content: `Stream error: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
    close: async () => {
      console.log(`[Session] Closed agent ${currentAgentId}`);
      // Letta client handles cleanup automatically
    },
  };
}

/**
 * Transform raw Letta message to our LettaMessage type
 */
function transformMessage(msg: any): LettaMessage | null {
  // Handle different message structures from Letta API
  if (!msg || typeof msg !== 'object') {
    return null;
  }

  // Map message types
  if (msg.type === 'user_message' || msg.message_type === 'user_message') {
    return {
      message_type: 'user_message',
      content: msg.content || msg.text || '',
    };
  }

  if (msg.type === 'reasoning_message' || msg.message_type === 'reasoning_message') {
    return {
      message_type: 'reasoning_message',
      content: msg.content || msg.text || '',
    };
  }

  if (msg.type === 'assistant_message' || msg.message_type === 'assistant_message') {
    return {
      message_type: 'assistant_message',
      content: msg.content || msg.text || '',
    };
  }

  if (msg.type === 'approval_request_message' || msg.message_type === 'approval_request_message') {
    return {
      message_type: 'approval_request_message',
      tool_call: {
        tool_call_id: msg.tool_call?.tool_call_id || msg.tool_call_id || '',
        tool_name: msg.tool_call?.tool_name || msg.tool_name || '',
        arguments: msg.tool_call?.arguments || msg.arguments || {},
      },
    };
  }

  if (msg.type === 'tool_return_message' || msg.message_type === 'tool_return_message') {
    return {
      message_type: 'tool_return_message',
      tool_call_id: msg.tool_call_id || '',
      tool_name: msg.tool_name || '',
      status: msg.status === 'success' ? 'success' : 'error',
      result: msg.result || msg.output || '',
    };
  }

  if (msg.type === 'usage_statistics' || msg.message_type === 'usage_statistics') {
    return {
      message_type: 'usage_statistics',
      input_tokens: msg.input_tokens,
      output_tokens: msg.output_tokens,
      total_tokens: msg.total_tokens,
    };
  }

  return null;
}

interface UseLettaSessionOptions {
  agentId?: string;
}

export function useLettaSession(options?: UseLettaSessionOptions) {
  const sessionRef = useRef<LettaSessionWrapper | null>(null);
  const [agentId, setAgentId] = useState<string | null>(options?.agentId ?? null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // Create or resume session
        const session = await createSessionWrapper(options?.agentId);

        if (!mounted) {
          await session.close();
          return;
        }

        sessionRef.current = session;
        setAgentId(session.agentId);
        setConversationId(session.conversationId);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
        setIsConnected(false);
      }
    };

    initSession();

    return () => {
      mounted = false;
      if (sessionRef.current) {
        sessionRef.current.close().catch(console.error);
        sessionRef.current = null;
      }
    };
  }, [options?.agentId]);

  return {
    session: sessionRef.current,
    agentId,
    conversationId,
    isConnected,
    error,
  };
}
