/**
 * StatusBar.tsx — Bottom status bar showing agent info and current state.
 *
 * Props:
 * - agentId: string | null — current agent ID
 * - status: 'idle' | 'thinking' | 'streaming' | 'error'
 * - mode: AppMode — current working mode (plan | build)
 * - error?: string — error message if status === 'error'
 *
 * Layout:
 * ┌──────────────────────────────────────────────────┐
 * │ 🤖 agent-abc123  BUILD │ ● streaming │ OpenLetta │
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
import type { AppMode } from '../types/letta.js';

export type AppStatus = 'idle' | 'thinking' | 'streaming' | 'error';

interface StatusBarProps {
  agentId: string | null;
  status: AppStatus;
  mode: AppMode;
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

export function StatusBar({ agentId, status, mode, error }: StatusBarProps): React.ReactElement {
  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
      <Box>
        <Text dimColor>
          {agentId ? `🤖 ${agentId}` : '🤖 no agent'}
        </Text>
        <Box marginLeft={2}>
          <Text bold color={mode === 'build' ? 'red' : 'blue'}>
            {mode.toUpperCase()}
          </Text>
        </Box>
      </Box>

      <Text color={STATUS_COLORS[status]}>
        {STATUS_LABELS[status]}
        {error ? ` — ${error}` : ''}
      </Text>

      <Text dimColor>OpenLetta v0.1</Text>
    </Box>
  );
}
