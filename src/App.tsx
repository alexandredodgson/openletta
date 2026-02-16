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

import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import Conf from 'conf';
import { ChatView, type Message } from './components/ChatView.js';
import { InputBar } from './components/InputBar.js';
import { StreamRenderer } from './components/StreamRenderer.js';
import { StatusBar, type AppStatus } from './components/StatusBar.js';
import { useLettaSession } from './hooks/useLettaSession.js';
import { useStream } from './hooks/useStream.js';

// Persistent config for agentId
const config = new Conf({ projectName: 'openletta' });

export function App(): React.ReactElement {
  const { exit } = useApp();

  // Load saved agentId from config
  const savedAgentId = config.get('agentId') as string | undefined;

  // Initialize session
  const { session, agentId, isConnected, error: sessionError } = useLettaSession({
    agentId: savedAgentId,
  });

  // Save agentId when it changes
  useEffect(() => {
    if (agentId) {
      config.set('agentId', agentId);
    }
  }, [agentId]);

  // Message history
  const [messages, setMessages] = useState<Message[]>([]);

  // App status
  const [status, setStatus] = useState<AppStatus>('idle');

  // Stream management
  const { streamContent, isStreaming, startStream } = useStream();

  // Handle message submission
  const handleSubmit = async (text: string) => {
    if (!session || !isConnected) return;

    // Add user message to history
    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    // Start thinking
    setStatus('thinking');

    try {
      // Send message to Letta
      await session.send(text);

      // Start streaming the response
      setStatus('streaming');
      const response = await startStream(session.stream());

      // Add assistant message to history
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);

      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ]);
    }
  };

  // Handle Ctrl+C gracefully
  useEffect(() => {
    const cleanup = () => {
      if (session) {
        session.close();
      }
      exit();
    };

    // Note: Ink handles Ctrl+C automatically, but we want to clean up
    process.on('SIGINT', cleanup);

    return () => {
      process.off('SIGINT', cleanup);
    };
  }, [session, exit]);

  // Show error if session failed to initialize
  if (sessionError) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Failed to initialize Letta session:</Text>
        <Text>{sessionError}</Text>
        <Text dimColor>Make sure Letta Code is installed and authenticated:</Text>
        <Text dimColor>npm i -g @letta-ai/letta-code && letta</Text>
      </Box>
    );
  }

  // Show loading while connecting
  if (!isConnected) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">Connecting to Letta...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      <StatusBar agentId={agentId} status={status} />

      <Box flexDirection="column" flexGrow={1} padding={1}>
        <ChatView messages={messages} />
        <StreamRenderer content={streamContent} isStreaming={isStreaming} />
      </Box>

      <InputBar onSubmit={handleSubmit} disabled={status !== 'idle'} />
    </Box>
  );
}
