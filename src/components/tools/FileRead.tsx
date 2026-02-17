/**
 * FileRead.tsx — Renders file content read from disk
 *
 * Features:
 * - Shows file path
 * - Line numbers for readability
 * - Truncates large files
 * - Basic syntax hint based on extension
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { ToolCallMessage, ToolReturnMessage } from '../../types/letta.js';

interface FileReadProps {
  toolCall: ToolCallMessage;
  toolReturn: ToolReturnMessage;
}

export function FileRead({ toolCall, toolReturn }: FileReadProps): React.ReactElement {
  const filePath = (toolCall.arguments.file_path as string) || '(path unavailable)';
  const maxLines = 30;
  const lines = toolReturn.result.split('\n');
  const displayLines = lines.slice(0, maxLines);
  const isTruncated = lines.length > maxLines;

  // Get file extension for syntax hint
  const ext = filePath.split('.').pop()?.toLowerCase() || 'txt';
  const langLabel = ext === 'tsx' || ext === 'ts' ? 'TypeScript' : ext === 'py' ? 'Python' : ext === 'json' ? 'JSON' : ext;

  return (
    <Box flexDirection="column">
      {/* File path header */}
      <Box marginBottom={1} paddingX={1} borderBottom borderColor="gray">
        <Text bold color="cyan">
          📄 {filePath}
        </Text>
        <Box marginLeft={1}>
          <Text dimColor>({langLabel})</Text>
        </Box>
      </Box>

      {/* File content with line numbers */}
      <Box flexDirection="column" paddingX={1}>
        {displayLines.map((line, i) => (
          <Box key={i}>
            <Text dimColor>{String(i + 1).padStart(4, ' ')}</Text>
            <Box marginLeft={1}>
              <Text>{line}</Text>
            </Box>
          </Box>
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
