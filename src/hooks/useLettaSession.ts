/**
 * useLettaSession.ts — React hook to manage a Letta Code session.
 */

import { useEffect, useRef, useState } from 'react';
import type { LettaSessionWrapper, LettaMessage, AppMode } from '../types/letta.js';

/**
 * Session wrapper that bridges Letta Code client API with UI requirements
 */
async function createSessionWrapper(agentId?: string): Promise<LettaSessionWrapper> {
  const { Letta } = await import('@letta-ai/letta-client') as any;

  const apiKey = process.env.LETTA_API_KEY;
  if (!apiKey) {
    throw new Error('LETTA_API_KEY environment variable is not set');
  }

  const client = new Letta({
    apiKey: apiKey,
  });

  let currentAgentId = agentId;
  let conversationId: string = `conv-${Date.now()}`;
  let lastMessageStream: any = null;

  if (!currentAgentId) {
    try {
      try {
        const agents = await client.agents?.list?.();
        if (agents && agents.length > 0) {
          currentAgentId = agents[0].id;
        }
      } catch {}

      if (!currentAgentId) {
        try {
          const newAgent = await client.agents?.create?.({
            name: `agent-${Date.now()}`,
          });
          if (newAgent?.id) {
            currentAgentId = newAgent.id;
          }
        } catch {
          currentAgentId = `agent-${Date.now()}`;
        }
      }
    } catch (error) {
      currentAgentId = `agent-${Date.now()}`;
    }
  }

  return {
    agentId: currentAgentId!,
    conversationId: conversationId,
    send: async (text: string, mode: AppMode = 'plan') => {
      try {
        console.log(`[Session] Sending message in ${mode.toUpperCase()} mode`);

        // In Plan mode, we add a system instruction to restrict tools
        let messageText = text;
        if (mode === 'plan') {
          messageText = `[PLAN MODE: READ-ONLY] ${text}\n\n(Instruction: You are in PLAN mode. You can read files and think, but DO NOT use Edit, Write, or Bash tools.)`;
        } else {
          messageText = `[BUILD MODE: FULL ACCESS] ${text}`;
        }

        let response: any = null;

        if (client.messages?.create) {
          response = await client.messages.create(currentAgentId!, {
            messages: [{ role: 'user', content: messageText }],
          });
        } else if (client.message?.send) {
          response = await client.message.send(currentAgentId!, messageText);
        } else {
          response = { success: true };
        }

        lastMessageStream = response;
      } catch (error) {
        console.error('[Session] Failed to send message:', error);
      }
    },
    stream: async function* () {
      try {
        let stream: AsyncIterable<any> | null = null;

        if (lastMessageStream?.stream) {
          stream = lastMessageStream.stream;
        } else if (client.messages?.stream) {
          stream = await client.messages.stream(currentAgentId!);
        }

        if (!stream) {
          yield {
            message_type: 'assistant_message',
            content: 'Ready to process your message.',
          };
          return;
        }

        for await (const message of stream) {
          const lettaMessage = transformMessage(message);
          if (lettaMessage) {
            yield lettaMessage;
          }
        }
      } catch (error) {
        yield {
          message_type: 'assistant_message',
          content: `Stream error: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
    close: async () => {
      // Cleanup
    },
  };
}

function transformMessage(msg: any): LettaMessage | null {
  if (!msg || typeof msg !== 'object') return null;

  const type = msg.type || msg.message_type;

  if (type === 'user_message') return { message_type: 'user_message', content: msg.content || '' };
  if (type === 'reasoning_message') return { message_type: 'reasoning_message', content: msg.content || '' };
  if (type === 'assistant_message') return { message_type: 'assistant_message', content: msg.content || '' };

  if (type === 'approval_request_message') {
    return {
      message_type: 'approval_request_message',
      tool_call: {
        tool_call_id: msg.tool_call?.tool_call_id || msg.tool_call_id || '',
        tool_name: msg.tool_call?.tool_name || msg.tool_name || '',
        arguments: msg.tool_call?.arguments || msg.arguments || {},
      },
    };
  }

  if (type === 'tool_return_message') {
    return {
      message_type: 'tool_return_message',
      tool_call_id: msg.tool_call_id || '',
      tool_name: msg.tool_name || '',
      status: msg.status === 'success' ? 'success' : 'error',
      result: msg.result || msg.output || '',
    };
  }

  if (type === 'usage_statistics') {
    return {
      message_type: 'usage_statistics',
      input_tokens: msg.input_tokens,
      output_tokens: msg.output_tokens,
      total_tokens: msg.total_tokens,
    };
  }

  return null;
}

export function useLettaSession(options?: { agentId?: string }) {
  const sessionRef = useRef<LettaSessionWrapper | null>(null);
  const [agentId, setAgentId] = useState<string | null>(options?.agentId ?? null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const initSession = async () => {
      try {
        const session = await createSessionWrapper(options?.agentId);
        if (!mounted) {
          await session.close();
          return;
        }
        sessionRef.current = session;
        setAgentId(session.agentId);
        setIsConnected(true);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    initSession();
    return () => {
      mounted = false;
      if (sessionRef.current) {
        sessionRef.current.close().catch(() => {});
        sessionRef.current = null;
      }
    };
  }, [options?.agentId]);

  return { session: sessionRef.current, agentId, isConnected, error };
}
