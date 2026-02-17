/**
 * FileDiff.tsx — Renders unified diff for file edits
 *
 * Features:
 * - Shows file path
 * - Unified diff format (like git diff)
 * - Green for additions, red for deletions
 * - Truncates very large diffs
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { ToolCallMessage, ToolReturnMessage } from '../../types/letta.js';

interface FileDiffProps {
  toolCall: ToolCallMessage;
  toolReturn: ToolReturnMessage;
}

export function FileDiff({ toolCall, toolReturn }: FileDiffProps): React.ReactElement {
  const filePath = (toolCall.arguments.file_path as string) || '(path unavailable)';
  const maxLines = 25;
  const diffLines = toolReturn.result.split('\n');
  const displayLines = diffLines.slice(0, maxLines);
  const isTruncated = diffLines.length > maxLines;

  const getLineColor = (line: string): string | undefined => {
    if (line.startsWith('+') && !line.startsWith('+++')) return 'green';
    if (line.startsWith('-') && !line.startsWith('---')) return 'red';
    if (line.startsWith('@@')) return 'cyan';
    return undefined;
  };

  return (
    <Box flexDirection="column">
      {/* File path header */}
      <Box marginBottom={1} paddingX={1} borderBottom borderColor="gray">
        <Text bold color="magenta">
          ✏️ {filePath}
        </Text>
      </Box>

      {/* Diff content */}
      <Box flexDirection="column" paddingX={1}>
        {displayLines.map((line, i) => {
          const lineColor = getLineColor(line);
          return (
            <Text key={i} color={lineColor}>
              {line || ' '}
            </Text>
          );
        })}
        {isTruncated && (
          <Box marginTop={1}>
            <Text dimColor>... ({diffLines.length - maxLines} more lines)</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
