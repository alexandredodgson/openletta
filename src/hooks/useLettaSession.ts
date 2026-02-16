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

// TODO Phase 1: implement this hook
// import { createSession, resumeSession } from '@letta-ai/letta-code-sdk';

export function useLettaSession(_options?: { agentId?: string }) {
  // Placeholder — implement per the above spec
  return {
    session: null,
    agentId: null as string | null,
    conversationId: null as string | null,
    isConnected: false,
    error: null as string | null,
  };
}
