/**
 * StatusBar.tsx — Bottom status bar showing agent info and current state.
 *
 * Props:
 * - agentId: string | null — current agent ID
 * - status: 'idle' | 'thinking' | 'streaming' | 'error'
 * - error?: string — error message if status === 'error'
 *
 * Layout:
 * ┌──────────────────────────────────────────────────┐
 * │ 🤖 agent-abc123 │ ● streaming │ OpenLetta v0.1  │
 * └──────────────────────────────────────────────────┘
 *
 * Colors:
 * - idle: gray
 * - thinking: yellow
 * - streaming: green
 * - error: red
 */

import React from 'react';
import { Box, Text } from 'ink';

export type AppStatus = 'idle' | 'thinking' | 'streaming' | 'error';

interface StatusBarProps {
  agentId: string | null;
  status: AppStatus;
  error?: string;
}

const STATUS_COLORS: Record<AppStatus, string> = {
  idle: 'gray',
  thinking: 'yellow',
  streaming: 'green',
  error: 'red',
};

const STATUS_LABELS: Record<AppStatus, string> = {
  idle: '● idle',
  thinking: '◉ thinking',
  streaming: '◉ streaming',
  error: '✖ error',
};

export function StatusBar({ agentId, status, error }: StatusBarProps): React.ReactElement {
  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
      <Text dimColor>
        {agentId ? `🤖 ${agentId}` : '🤖 no agent'}
      </Text>
      <Text color={STATUS_COLORS[status]}>
        {STATUS_LABELS[status]}
        {error ? ` — ${error}` : ''}
      </Text>
      <Text dimColor>OpenLetta v0.1</Text>
    </Box>
  );
}
