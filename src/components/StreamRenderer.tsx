/**
 * StreamRenderer.tsx — Displays the current streaming response in real-time.
 *
 * Props:
 * - content: string — the accumulated text so far (grows as tokens arrive)
 * - isStreaming: boolean — whether we're currently receiving tokens
 *
 * Behavior:
 * - Shows the text being generated token by token
 * - Displays a blinking cursor or spinner while streaming
 * - When streaming finishes, this component may become empty
 *   (the complete message gets moved to ChatView)
 * - Markdown rendering for the content (basic: bold, code blocks)
 *
 * Implementation:
 * - This is a "live" display area that updates frequently
 * - Keep it simple for Phase 1: just render the text as it comes
 * - Add markdown rendering later (use marked-terminal)
 */

import React from 'react';
import { renderMarkdown } from '../utils/format.js';
import { Box, Text } from 'ink';

interface StreamRendererProps {
  content: string;
  isStreaming: boolean;
}

export function StreamRenderer({ content, isStreaming }: StreamRendererProps): React.ReactElement {
  if (!content && !isStreaming) return <></>;

  return (
    <Box marginBottom={1}>
      <Text color="green">{'🤖 > '}</Text>
      <Text>
        {renderMarkdown(content)}
        {isStreaming ? '▊' : ''}
      </Text>
    </Box>
  );
}
