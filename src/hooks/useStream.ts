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

import { useState, useRef } from 'react';
import type { SDKMessage } from '@letta-ai/letta-code-sdk';


export function useStream() {
  const [streamContent, setStreamContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(false);

  const startStream = async (stream: AsyncIterable<SDKMessage>): Promise<string> => {
    abortRef.current = false;
    setIsStreaming(true);
    setStreamContent('');

    let fullContent = '';

    try {
      for await (const msg of stream) {
        if (abortRef.current) break;

        if (msg.type === 'assistant') {
          fullContent += msg.content;
          setStreamContent(fullContent);
        } else if (msg.type === 'result') {
          // Stream finished
          setIsStreaming(false);
          return fullContent;
        }
      }
    } catch (error) {
      setIsStreaming(false);
      throw error;
    }

    setIsStreaming(false);
    return fullContent;
  };

  const abortStream = () => {
    abortRef.current = true;
    setIsStreaming(false);
  };

  const clearStream = () => {
    setStreamContent("");
  };

  return {
    streamContent,
    isStreaming,
    startStream,
    abortStream, clearStream,
  };
}
