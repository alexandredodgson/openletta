/**
 * ChatView.tsx — Scrollable message history.
 *
 * Props:
 * - messages: Array<{ role: 'user' | 'assistant', content: string }>
 *
 * Behavior:
 * - Renders all messages with visual distinction (color/prefix) between user and assistant
 * - Auto-scrolls to the bottom when new messages arrive
 * - User messages: bold, prefixed with "You >"
 * - Assistant messages: default color, prefixed with "🤖 >"
 * - Use Ink's <Box> with flexGrow to fill available vertical space
 * - Markdown rendering for assistant messages (via marked-terminal)
 *
 * Tips for implementation:
 * - Ink doesn't have native scroll. Options:
 *   a) Show only the last N messages that fit the terminal height
 *   b) Use ink-scroll-area or similar community component
 *   c) Render all and let the terminal scroll naturally (simplest for MVP)
 * - For MVP, option (c) is fine. Optimize in later phases.
 */

import React from 'react';
import { Box, Text } from 'ink';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatViewProps {
  messages: Message[];
}

export function ChatView({ messages }: ChatViewProps): React.ReactElement {
  // TODO: implement
  return (
    <Box flexDirection="column" flexGrow={1}>
      {messages.map((msg, i) => (
        <Box key={i} marginBottom={1}>
          <Text bold={msg.role === 'user'} color={msg.role === 'user' ? 'cyan' : undefined}>
            {msg.role === 'user' ? 'You > ' : '🤖 > '}
          </Text>
          <Text>{msg.content}</Text>
        </Box>
      ))}
    </Box>
  );
}
