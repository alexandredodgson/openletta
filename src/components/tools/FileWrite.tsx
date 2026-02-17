/**
 * FileWrite.tsx — Renders file write/creation confirmation
 *
 * Features:
 * - Shows file path
 * - Shows byte count
 * - Preview of first/last few lines
 * - Success/error status
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { ToolCallMessage, ToolReturnMessage } from '../../types/letta.js';

interface FileWriteProps {
  toolCall: ToolCallMessage;
  toolReturn: ToolReturnMessage;
}

export function FileWrite({ toolCall, toolReturn }: FileWriteProps): React.ReactElement {
  const filePath = (toolCall.arguments.file_path as string) || '(path unavailable)';
  const content = (toolCall.arguments.file_text as string) || '';
  const byteCount = Buffer.byteLength(content, 'utf-8');
  const lineCount = content.split('\n').length;

  // Show first few lines as preview
  const previewLines = content.split('\n').slice(0, 5);

  return (
    <Box flexDirection="column">
      {/* File path header */}
      <Box marginBottom={1} paddingX={1} borderBottom borderColor="gray">
        <Text bold color="green">
          ✍️ {filePath}
        </Text>
      </Box>

      {/* File stats */}
      <Box marginBottom={1} paddingX={1}>
        <Text dimColor>
          {byteCount} bytes · {lineCount} lines
        </Text>
      </Box>

      {/* Content preview */}
      <Box flexDirection="column" paddingX={1} marginBottom={1}>
        {previewLines.map((line, i) => (
          <Text key={i} dimColor>
            {line || ' '}
          </Text>
        ))}
        {lineCount > 5 && (
          <Text dimColor>... ({lineCount - 5} more lines)</Text>
        )}
      </Box>

      {/* Status message from result */}
      {toolReturn.status === 'success' && (
        <Box paddingX={1} borderLeft borderColor="green">
          <Text color="green">✓ File written successfully</Text>
        </Box>
      )}

      {toolReturn.status === 'error' && (
        <Box paddingX={1} borderLeft borderColor="red">
          <Text color="red">✗ Error: {toolReturn.result}</Text>
        </Box>
      )}
    </Box>
  );
}
