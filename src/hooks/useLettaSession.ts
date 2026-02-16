/**
 * useLettaSession.ts — React hook to manage a Letta Code session.
 *
 * Responsibilities:
 * - Create a new session or resume an existing one
 * - Expose send(), stream iterator, close()
 * - Track session state (agentId, conversationId, connected)
 * - Handle cleanup on unmount
 *
 * Usage in App.tsx:
 * ```tsx
 * const { session, agentId, conversationId, isConnected, error } = useLettaSession({
 *   agentId: savedAgentId,  // optional, for resume
 * });
 * ```
 *
 * Key SDK functions used:
 * - createSession(agentId?, options?) → session
 * - resumeSession(agentId | conversationId) → session
 * - session.send(text) → void
 * - session.stream() → AsyncIterable<SDKAssistantMessage | SDKResultMessage>
 * - session.close() → void
 * - session.agentId → string
 * - session.conversationId → string
 *
 * Implementation notes:
 * - Use useRef to hold the session object (not state, to avoid re-renders)
 * - Use useEffect for cleanup (session.close() on unmount)
 * - The session persists across renders — only create once
 * - If agentId is provided, use resumeSession; otherwise createSession
 * - Store agentId after first session creation for future resume
 */

import { useEffect, useRef, useState } from 'react';
import { createSession, resumeSession } from '@letta-ai/letta-code-sdk';

type LettaSession = Awaited<ReturnType<typeof createSession>>;

interface UseLettaSessionOptions {
  agentId?: string;
}

export function useLettaSession(options?: UseLettaSessionOptions) {
  const sessionRef = useRef<LettaSession | null>(null);
  const [agentId, setAgentId] = useState<string | null>(options?.agentId ?? null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // Create or resume session
        const session = options?.agentId
          ? await resumeSession(options.agentId)
          : await createSession();

        if (!mounted) {
          session.close();
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
        sessionRef.current.close();
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
