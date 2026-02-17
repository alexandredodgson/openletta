/**
 * ToolCallCard.tsx — Generic container for tool execution results
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
  const isBlocked = toolCall.isBlocked;
  const statusColor = isBlocked ? 'yellow' : (toolReturn?.status === 'success' ? 'green' : 'red');
  const statusIcon = isBlocked ? '⚠' : (toolReturn?.status === 'success' ? '✓' : '✗');
  const statusLabel = isBlocked ? 'BLOCKED' : (toolReturn ? toolReturn.status.toUpperCase() : 'PENDING');

  return (
    <Box flexDirection="column" marginLeft={2} marginBottom={1} borderStyle="round" borderColor={isBlocked ? 'yellow' : 'gray'}>
      {/* Header: Tool name + ID + status */}
      <Box marginBottom={1}>
        <Text bold color={isBlocked ? 'yellow' : 'blue'}>
          🔧 {toolCall.tool_name}
        </Text>
        <Box marginLeft={1}>
          <Text dimColor>[ID: {toolCall.tool_call_id}]</Text>
        </Box>
        <Box marginLeft={1}>
          <Text bold color={statusColor}>
            {statusIcon} {statusLabel}
          </Text>
        </Box>
      </Box>

      {/* Block reason if applicable */}
      {isBlocked && (
        <Box paddingX={1} marginBottom={1} borderStyle="double" borderColor="yellow">
          <Text color="yellow" bold>Plan Mode Restriction:</Text>
          <Text color="white"> {toolCall.blockReason}</Text>
        </Box>
      )}

      {/* Tool-specific content (only if not blocked or children specifically handle it) */}
      {!isBlocked && children && (
        <Box flexDirection="column" marginBottom={1}>
          {children}
        </Box>
      )}

      {/* Footer: Tool result summary (if no children provided full output) */}
      {!isBlocked && !children && toolReturn && (
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
