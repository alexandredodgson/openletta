/**
 * StatusBar.tsx — Bottom status bar showing agent info and current state.
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import type { AppMode } from '../types/letta.js';

export type AppStatus = 'idle' | 'thinking' | 'streaming' | 'error' | 'processing';

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
  processing: 'cyan',
};

const STATUS_LABELS: Record<AppStatus, string> = {
  idle: '● idle',
  thinking: '◉ thinking',
  streaming: '◉ streaming',
  error: '✖ error',
  processing: '◈ processing',
};

export function StatusBar({ agentId, status, mode, error }: StatusBarProps): React.ReactElement {
  const [flash, setFlash] = useState(false);

  // Simple animation: flash the mode when it changes
  useEffect(() => {
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 800);
    return () => clearTimeout(timer);
  }, [mode]);

  return (
    <Box borderStyle="single" borderColor={flash ? 'yellow' : 'gray'} paddingX={1} justifyContent="space-between">
      <Box>
        <Text dimColor>
          {agentId ? `🤖 ${agentId}` : '🤖 no agent'}
        </Text>
        <Box marginLeft={2}>
          {flash ? (
            <Text bold color="yellow" inverse>
              {` SWITCHING TO ${mode.toUpperCase()} `}
            </Text>
          ) : (
            <Text bold color={mode === 'build' ? 'red' : 'blue'}>
              {mode.toUpperCase()}
            </Text>
          )}
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
