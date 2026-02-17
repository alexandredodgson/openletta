/**
 * ToolCallCard.tsx — Generic container for tool execution results
 *
 * Renders a tool execution with:
 * - Header: tool name, ID, status badge
 * - Content: delegated to tool-specific renderers
 * - Footer: execution details (duration, result status)
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { ToolCallMessage, ToolReturnMessage } from '../types/letta.js';

interface ToolCallCardProps {
  toolCall: ToolCallMessage;
  toolReturn?: ToolReturnMessage;
  children?: React.ReactNode;
}

export function ToolCallCard({ toolCall, toolReturn, children }: ToolCallCardProps): React.ReactElement {
  const statusColor = toolReturn?.status === 'success' ? 'green' : 'red';
  const statusIcon = toolReturn?.status === 'success' ? '✓' : '✗';

  return (
    <Box flexDirection="column" marginLeft={2} marginBottom={1} borderStyle="round" borderColor="gray">
      {/* Header: Tool name + ID + status */}
      <Box marginBottom={1}>
        <Text bold color="blue">
          🔧 {toolCall.tool_name}
        </Text>
        <Box marginLeft={1}>
          <Text dimColor>[ID: {toolCall.tool_call_id}]</Text>
        </Box>
        {toolReturn && (
          <Box marginLeft={1}>
            <Text bold color={statusColor}>
              {statusIcon} {toolReturn.status.toUpperCase()}
            </Text>
          </Box>
        )}
      </Box>

      {/* Tool-specific content */}
      {children && (
        <Box flexDirection="column" marginBottom={1}>
          {children}
        </Box>
      )}

      {/* Footer: Tool result summary (if no children provided full output) */}
      {!children && toolReturn && (
        <Box flexDirection="column" marginTop={1} paddingLeft={1} borderLeft borderColor="gray">
          <Text dimColor>{toolReturn.result.substring(0, 200)}</Text>
          {toolReturn.result.length > 200 && (
            <Text dimColor>... (truncated)</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
