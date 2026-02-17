/**
 * App.tsx — Root component for OpenLetta TUI.
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
import type { DisplayMessage, AppMode } from './types/letta.js';

// Persistent config for agentId and mode
const config = new Conf({ projectName: 'openletta' });

interface AppProps {
  initialAgentId?: string;
  forceNew?: boolean;
  initialMode?: AppMode;
}

export function App({ initialAgentId, forceNew, initialMode }: AppProps): React.ReactElement {
  const { exit } = useApp();

  // Load saved agentId from config
  const savedAgentId = forceNew ? undefined : (initialAgentId || config.get('agentId') as string | undefined);

  // App mode (Plan/Build)
  const [mode, setMode] = useState<AppMode>(initialMode || (config.get('mode') as AppMode) || 'plan');

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

  // Save mode when it changes and update session
  useEffect(() => {
    config.set('mode', mode);
    if (session && isConnected) {
      session.updateMode(mode).catch(err => {
        console.error('Failed to update session mode:', err);
      });
    }
  }, [mode, session, isConnected]);

  // Message history
  const [messages, setMessages] = useState<(Message | DisplayMessage)[]>([]);

  // App status
  const [status, setStatus] = useState<AppStatus>('idle');

  // Stream management
  const { streamContent, isStreaming, startStream, clearStream } = useStream();

  // Toggle mode
  const handleToggleMode = () => {
    setMode((prev) => (prev === 'plan' ? 'build' : 'plan'));
  };

  // Handle message submission
  const handleSubmit = async (text: string) => {
    if (!session || !isConnected) return;

    // Add user message to history
    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    // Start thinking
    setStatus('thinking');

    try {
      // Send message to Letta
      await session.send(text, mode);

      // Start streaming the response
      setStatus('streaming');
      const fullMessage = await startStream(session.stream(mode));

      // Add assistant message to history
      setMessages((prev) => [...prev, fullMessage]);
      clearStream();

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
        session.close().catch(() => {});
      }
      exit();
    };

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
      <StatusBar agentId={agentId} status={status} mode={mode} />

      <Box flexDirection="column" flexGrow={1} padding={1}>
        <ChatView messages={messages} />
        <StreamRenderer content={streamContent} isStreaming={isStreaming} />
      </Box>

      <InputBar
        onSubmit={handleSubmit}
        onToggleMode={handleToggleMode}
        disabled={status !== 'idle'}
      />
    </Box>
  );
}
