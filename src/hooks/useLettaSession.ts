/**
 * useLettaSession.ts — React hook to manage a Letta Code session.
 */

import { useEffect, useRef, useState } from 'react';
import type { LettaSessionWrapper, LettaMessage, AppMode, ToolCallMessage } from '../types/letta.js';

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

  // Initialize agent if needed
  if (!currentAgentId) {
    try {
      const agents = await client.agents?.list?.();
      if (agents && agents.length > 0) {
        currentAgentId = agents[0].id;
      }

      if (!currentAgentId) {
        const newAgent = await client.agents?.create?.({
          name: `agent-${Date.now()}`,
        });
        if (newAgent?.id) {
          currentAgentId = newAgent.id;
        }
      }
    } catch (error) {
      console.warn('[Session] Failed to fetch agents, using fallback ID');
      currentAgentId = `agent-${Date.now()}`;
    }
  }

  return {
    agentId: currentAgentId!,
    conversationId: conversationId,

    updateMode: async (newMode: AppMode) => {
      try {
        if (!currentAgentId) return;
        console.log(`[Session] Official mode update: ${newMode.toUpperCase()}`);

        const toolsToRestrict = ['bash', 'Bash', 'edit', 'Edit', 'write', 'Write', 'edit_file', 'write_file'];

        try {
          const agentState = await client.agents.retrieve(currentAgentId);
          const tools = agentState.tools || [];

          for (const toolName of tools) {
            const isRestrictable = toolsToRestrict.some(t =>
              toolName.toLowerCase().includes(t.toLowerCase())
            );

            if (isRestrictable) {
              await client.agents.tools.updateApproval(toolName, {
                agent_id: currentAgentId,
                body_requires_approval: newMode === 'plan'
              });
            }
          }
        } catch (err) {
          console.error('[Session] Tool approval update failed:', err);
        }

        try {
          const agentState = await client.agents.retrieve(currentAgentId);
          let baseSystem = agentState.system || '';
          baseSystem = baseSystem.replace(/\[MODE:.*?\][\s\S]*?\[\/MODE\]\n?/g, '');

          const modeInstruction = newMode === 'plan'
            ? "[MODE:PLAN] You are in PLAN mode (Read-Only). You can read files and reason, but any attempt to modify the system (Edit, Write, Bash) will be blocked or require explicit approval. Use --dry-run for bash commands if you want to test them safely. [/MODE]\n"
            : "[MODE:BUILD] You are in BUILD mode (Full Access). All tools are authorized. [/MODE]\n";

          await client.agents.update(currentAgentId, {
            system: modeInstruction + baseSystem
          });
        } catch (err) {
          console.error('[Session] System prompt update failed:', err);
        }
      } catch (error) {
        console.error('[Session] Error during updateMode:', error);
      }
    },

    send: async (text: string, mode: AppMode = 'plan') => {
      try {
        console.log(`[Session] Sending message in ${mode.toUpperCase()} mode`);
        const messageText = `[Context: ${mode.toUpperCase()} mode] ${text}`;

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
        throw error;
      }
    },

    stream: async function* (mode: AppMode = 'plan') {
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
            content: 'No stream available from Letta server.',
          } as LettaMessage;
          return;
        }

        for await (const message of stream) {
          const lettaMessage = transformMessage(message, mode);
          if (lettaMessage) {
            yield lettaMessage;
          }
        }
      } catch (error) {
        console.error('[Session] Stream consumption failed:', error);
        yield {
          message_type: 'assistant_message',
          content: `Stream error: ${error instanceof Error ? error.message : String(error)}`,
        } as LettaMessage;
      }
    },

    close: async () => {
      // Cleanup
    },
  };
}

function transformMessage(msg: any, mode: AppMode): LettaMessage | null {
  if (!msg || typeof msg !== 'object') return null;

  const type = msg.type || msg.message_type;

  if (type === 'user_message') return { message_type: 'user_message', content: msg.content || '' };
  if (type === 'reasoning_message') return { message_type: 'reasoning_message', content: msg.content || '' };
  if (type === 'assistant_message') return { message_type: 'assistant_message', content: msg.content || '' };

  if (type === 'approval_request_message' || msg.tool_call) {
    const toolCall = msg.tool_call || msg;
    const toolName = toolCall.tool_name || toolCall.name || '';
    const args = typeof toolCall.arguments === 'string'
      ? JSON.parse(toolCall.arguments)
      : toolCall.arguments || {};

    // Step 2: Client-side guard for Plan mode
    let isBlocked = false;
    let blockReason = '';

    if (mode === 'plan') {
      const restrictedTools = ['bash', 'Bash', 'edit', 'Edit', 'write', 'Write', 'edit_file', 'write_file'];
      const isRestricted = restrictedTools.some(t => toolName.toLowerCase().includes(t.toLowerCase()));

      if (isRestricted) {
        // Exception for bash dry-run
        const isBash = toolName.toLowerCase().includes('bash');
        const command = args.command || '';
        const isDryRun = command.includes('--dry-run');

        if (isBash && isDryRun) {
          isBlocked = false;
        } else {
          isBlocked = true;
          blockReason = `Tool '${toolName}' is blocked in PLAN mode. Switch to BUILD mode to execute modifications.`;
        }
      }
    }

    return {
      message_type: 'approval_request_message',
      tool_call: {
        tool_call_id: toolCall.tool_call_id || toolCall.id || '',
        tool_name: toolName,
        arguments: args,
        isBlocked,
        blockReason,
      },
    };
  }

  if (type === 'tool_return_message' || msg.status) {
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
