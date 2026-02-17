/**
 * BashOutput.tsx — Renders bash command output with ANSI color support
 *
 * Features:
 * - Preserves ANSI color codes
 * - Shows command that was executed (from arguments)
 * - Line wrapping for long output
 * - Truncates very long output with indicator
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { ToolCallMessage, ToolReturnMessage } from '../../types/letta.js';

interface BashOutputProps {
  toolCall: ToolCallMessage;
  toolReturn: ToolReturnMessage;
}

export function BashOutput({ toolCall, toolReturn }: BashOutputProps): React.ReactElement {
  // Extract command from arguments
  const command = (toolCall.arguments.command as string) || '(command unavailable)';
  const maxLines = 20;
  const lines = toolReturn.result.split('\n');
  const displayLines = lines.slice(0, maxLines);
  const isTruncated = lines.length > maxLines;

  return (
    <Box flexDirection="column">
      {/* Command that was executed */}
      <Box marginBottom={1} paddingX={1} borderBottom borderColor="gray">
        <Text bold color="yellow">
          $ {command}
        </Text>
      </Box>

      {/* Output with ANSI preserved */}
      <Box flexDirection="column" paddingX={1}>
        {displayLines.map((line, i) => (
          <Text key={i}>{line || ' '}</Text>
        ))}
        {isTruncated && (
          <Box marginTop={1}>
            <Text dimColor>... ({lines.length - maxLines} more lines)</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
