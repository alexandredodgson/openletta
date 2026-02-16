/**
 * App.tsx — Root component for OpenLetta TUI.
 *
 * Responsibilities:
 * - Initialize and manage the Letta session (via useLettaSession hook)
 * - Coordinate between InputBar, ChatView, StreamRenderer, StatusBar
 * - Manage the message history state
 * - Handle graceful shutdown on Ctrl+C
 *
 * Layout (top to bottom):
 * ┌──────────────────────────┐
 * │       StatusBar          │  ← agent info, mode, connection status
 * ├──────────────────────────┤
 * │                          │
 * │       ChatView           │  ← scrollable message history
 * │                          │
 * │   StreamRenderer         │  ← current streaming response (if active)
 * │                          │
 * ├──────────────────────────┤
 * │       InputBar           │  ← user input
 * └──────────────────────────┘
 */

import React from 'react';
import { Box, Text } from 'ink';

// TODO Phase 1: Build this out. Steps:
//
// 1. Import and use useLettaSession hook to create/resume a session
// 2. Manage messages state: Array<{ role: 'user' | 'assistant', content: string }>
// 3. Manage app status: 'idle' | 'thinking' | 'streaming'
// 4. Wire InputBar → session.send() → useStream → ChatView
// 5. Handle Ctrl+C via useApp().exit() + session.close()
// 6. Persist agentId to local config (conf package) for resume on restart
//
// See SPEC.md for Letta SDK API details.
// See ROADMAP.md for Phase 1 acceptance criteria.

export function App(): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Text>OpenLetta — Phase 1 scaffold</Text>
      <Text dimColor>This is the starting skeleton. Implement Phase 1 per ROADMAP.md.</Text>
    </Box>
  );
}
