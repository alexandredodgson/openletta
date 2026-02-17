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
import { renderMarkdown } from '../utils/format.js';
import { Box, Text } from 'ink';
import type { DisplayMessage } from '../types/letta.js';
import { ToolCallCard } from './ToolCallCard.js';
import { BashOutput } from './tools/BashOutput.js';
import { FileRead } from './tools/FileRead.js';
import { FileDiff } from './tools/FileDiff.js';
import { FileWrite } from './tools/FileWrite.js';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatViewProps {
  messages: (Message | DisplayMessage)[];
}

/**
 * Render the appropriate tool-specific component based on tool name
 */
function renderToolContent(msg: DisplayMessage, toolCallIndex: number) {
  const toolCall = msg.toolCalls?.[toolCallIndex];
  if (!toolCall) return null;

  // Find matching tool return (by tool_call_id)
  const toolReturn = msg.toolReturns?.find((tr) => tr.tool_call_id === toolCall.tool_call_id);

  // Dispatch to tool-specific renderer
  switch (toolCall.tool_name) {
    case 'bash':
    case 'Bash':
      return toolReturn ? (
        <ToolCallCard toolCall={toolCall} toolReturn={toolReturn}>
          <BashOutput toolCall={toolCall} toolReturn={toolReturn} />
        </ToolCallCard>
      ) : (
        <ToolCallCard toolCall={toolCall} />
      );

    case 'read':
    case 'Read':
      return toolReturn ? (
        <ToolCallCard toolCall={toolCall} toolReturn={toolReturn}>
          <FileRead toolCall={toolCall} toolReturn={toolReturn} />
        </ToolCallCard>
      ) : (
        <ToolCallCard toolCall={toolCall} />
      );

    case 'edit':
    case 'Edit':
      return toolReturn ? (
        <ToolCallCard toolCall={toolCall} toolReturn={toolReturn}>
          <FileDiff toolCall={toolCall} toolReturn={toolReturn} />
        </ToolCallCard>
      ) : (
        <ToolCallCard toolCall={toolCall} />
      );

    case 'write':
    case 'Write':
      return toolReturn ? (
        <ToolCallCard toolCall={toolCall} toolReturn={toolReturn}>
          <FileWrite toolCall={toolCall} toolReturn={toolReturn} />
        </ToolCallCard>
      ) : (
        <ToolCallCard toolCall={toolCall} />
      );

    default:
      // Fallback for unknown tools
      return <ToolCallCard toolCall={toolCall} toolReturn={toolReturn} />;
  }
}

export function ChatView({ messages }: ChatViewProps): React.ReactElement {
  return (
    <Box flexDirection="column" flexGrow={1}>
      {messages.map((msg, i) => (
        <Box key={i} flexDirection="column" marginBottom={1}>
          {/* Main message content */}
          <Box>
            <Text bold={msg.role === 'user'} color={msg.role === 'user' ? 'cyan' : undefined}>
              {msg.role === 'user' ? 'You > ' : '🤖 > '}
            </Text>
            <Text>
              {msg.role === 'assistant' && msg.content
                ? renderMarkdown(msg.content)
                : msg.content || ''}
            </Text>
          </Box>

          {/* Reasoning (Phase 2 preparation) */}
          {msg.role === 'assistant' && 'reasoning' in msg && msg.reasoning && msg.reasoning.length > 0 && (
            <Box marginLeft={2} flexDirection="column">
              <Text dimColor>💭 Reasoning:</Text>
              {msg.reasoning.map((r, j) => (
                <Text key={j} dimColor>
                  {r}
                </Text>
              ))}
            </Box>
          )}

          {/* Tool calls with rich rendering (Phase 2) */}
          {msg.role === 'assistant' && 'toolCalls' in msg && msg.toolCalls && msg.toolCalls.length > 0 && (
            <Box marginLeft={2} flexDirection="column" marginTop={1}>
              {msg.toolCalls.map((tc, j) => (
                <Box key={j} marginBottom={1}>
                  {renderToolContent(msg as DisplayMessage, j)}
                </Box>
              ))}
            </Box>
          )}

        </Box>
      ))}
    </Box>
  );
}
