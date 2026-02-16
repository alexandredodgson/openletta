/**
 * useStream.ts — React hook to consume a Letta stream and update state.
 *
 * Responsibilities:
 * - Take a session's stream() async iterator
 * - Accumulate assistant content as tokens arrive
 * - Detect result message (end of stream)
 * - Update status (streaming → idle)
 * - Return the streaming content and completion state
 *
 * Usage in App.tsx:
 * ```tsx
 * const { streamContent, isStreaming, startStream } = useStream();
 *
 * const handleSubmit = async (text: string) => {
 *   await session.send(text);
 *   const result = await startStream(session.stream());
 *   // result contains the final complete message
 * };
 * ```
 *
 * Implementation notes:
 * - Uses useState for streamContent (triggers re-render on each token)
 * - Uses useRef for abort control
 * - startStream returns a Promise that resolves when the stream ends
 * - The SDK streams SDKAssistantMessage (type: 'assistant', content: string)
 *   and SDKResultMessage (type: 'result', success, durationMs)
 * - Each 'assistant' message contains a chunk of text to append
 * - The 'result' message signals end of stream
 *
 * Performance:
 * - May need throttling/batching if tokens arrive too fast (React re-renders)
 * - For MVP, direct setState per token is fine
 */

// TODO Phase 1: implement this hook

export function useStream() {
  // Placeholder — implement per the above spec
  return {
    streamContent: '',
    isStreaming: false,
    startStream: async (_stream: AsyncIterable<unknown>): Promise<string> => {
      return '';
    },
  };
}
