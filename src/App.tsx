/**
 * App.tsx — Root component for OpenLetta TUI.
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import Conf from 'conf';
import fs from 'fs';
import { ChatView, type Message } from './components/ChatView.js';
import { InputBar } from './components/InputBar.js';
import { StreamRenderer } from './components/StreamRenderer.js';
import { StatusBar, type AppStatus } from './components/StatusBar.js';
import { Sidebar } from './components/Sidebar.js';
import { processFileReferences } from './utils/files.js';
import { parseCommand, getHelpText } from './utils/commands.js';
import { useLettaSession } from './hooks/useLettaSession.js';
import { useStream } from './hooks/useStream.js';
import { aggregateMessages } from './utils/letta.js';
import type { DisplayMessage, AppMode, Agent, Conversation } from './types/letta.js';

// Persistent config
const config = new Conf({ projectName: 'openletta' });

interface AppProps {
  initialAgentId?: string;
  forceNew?: boolean;
  initialMode?: AppMode;
}

export function App({ initialAgentId, forceNew, initialMode }: AppProps): React.ReactElement {
  const { exit } = useApp();

  // Load saved config
  const savedAgentId = forceNew ? undefined : (initialAgentId || config.get('agentId') as string | undefined);
  const savedConvId = config.get('conversationId') as string | undefined || 'default';

  // App mode (Plan/Build)
  const [mode, setMode] = useState<AppMode>(initialMode || (config.get('mode') as AppMode) || 'plan');

  // Multi-session state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentAgentId, setCurrentAgentId] = useState<string>(savedAgentId || '');
  const [currentConversationId, setCurrentConversationId] = useState<string>(savedConvId);
  const [focusArea, setFocusArea] = useState<'sidebar' | 'chat'>('chat');

  // Initialize session
  const { session, agentId, isConnected, error: sessionError } = useLettaSession({
    agentId: currentAgentId,
  });

  // Sync agentId from session
  useEffect(() => {
    if (agentId) {
      setCurrentAgentId(agentId);
      config.set('agentId', agentId);
    }
  }, [agentId]);

  // Load agents and conversations
  useEffect(() => {
    if (isConnected && session) {
      session.listAgents().then(setAgents);
      session.listConversations(currentAgentId).then(setConversations);
    }
  }, [isConnected, session, currentAgentId]);

  // Save mode when it changes and update session
  useEffect(() => {
    config.set('mode', mode);
    if (session && isConnected) {
      session.updateMode(mode).catch(() => {});
    }
  }, [mode, session, isConnected]);

  // Message history
  const [messages, setMessages] = useState<(Message | DisplayMessage)[]>([]);

  // App status
  const [status, setStatus] = useState<AppStatus>('idle');

  // Stream management
  const { streamContent, isStreaming, startStream, clearStream } = useStream();

  // Focus management
  useInput((input, key) => {
    if (input === 's' && key.ctrl) {
      setFocusArea((prev) => (prev === 'chat' ? 'sidebar' : 'chat'));
    }
  });

  // Toggle mode
  const handleToggleMode = () => {
    setMode((prev) => (prev === 'plan' ? 'build' : 'plan'));
  };

  // Handle agent switch
  const handleSelectAgent = async (id: string) => {
    if (!session) return;
    setStatus('processing');
    setCurrentAgentId(id);
    config.set('agentId', id);
    const history = await session.getHistory(id, 'default');
    setMessages(aggregateMessages(history));
    setCurrentConversationId('default');
    config.set('conversationId', 'default');
    setStatus('idle');
  };

  // Handle conversation switch
  const handleSelectConversation = async (id: string) => {
    if (!session) return;
    setStatus('processing');
    setCurrentConversationId(id);
    config.set('conversationId', id);
    const history = await session.getHistory(currentAgentId, id);
    setMessages(aggregateMessages(history));
    setStatus('idle');
  };

  // Handle message submission
  const handleSubmit = async (text: string) => {
    if (!session || !isConnected) return;

    if (text.startsWith('/')) {
      const action = parseCommand(text);

      switch (action.type) {
        case 'help':
          setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: getHelpText() }]);
          return;
        case 'agent':
          if (action.payload) {
            handleSelectAgent(action.payload);
          } else {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Usage: /agent <id>' }]);
          }
          return;
        case 'session':
          if (action.payload) {
            handleSelectConversation(action.payload);
          } else {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Usage: /session <id>' }]);
          }
          return;
        case 'memory':
          setStatus('processing');
          const memory = await session.getMemory();
          setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: `Current Memory:\n\`\`\`json\n${memory}\n\`\`\`` }]);
          setStatus('idle');
          return;
        case 'config':
          const confStr = JSON.stringify({
            agentId: currentAgentId,
            conversationId: currentConversationId,
            mode: mode,
            path: config.path
          }, null, 2);
          setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: `Current Config:\n\`\`\`json\n${confStr}\n\`\`\`` }]);
          return;
        case 'export':
          setStatus('processing');
          try {
            fs.writeFileSync('chat-export.json', JSON.stringify(messages, null, 2));
            setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: 'Chat history exported to chat-export.json' }]);
          } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Failed to export: ${e}` }]);
          }
          setStatus('idle');
          return;
        default:
          setMessages(prev => [...prev, { role: 'assistant', content: `Unknown command: ${text}. Type /help for assistance.` }]);
          return;
      }
    }

    setStatus('processing');

    try {
      // Phase 5: File Referencing (@)
      const processedText = await processFileReferences(text);

      setMessages((prev) => [...prev, { role: 'user', content: text }]);

      setStatus('thinking');
      await session.send(processedText, mode);
      setStatus('streaming');
      const fullMessage = await startStream(session.stream(mode));
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

  if (sessionError) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Failed to initialize Letta session:</Text>
        <Text>{sessionError}</Text>
      </Box>
    );
  }

  if (!isConnected) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">Connecting to Letta...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      <StatusBar agentId={currentAgentId} status={status} mode={mode} />

      <Box flexDirection="row" flexGrow={1}>
        <Sidebar
          agents={agents}
          conversations={conversations}
          selectedAgentId={currentAgentId}
          selectedConversationId={currentConversationId}
          onSelectAgent={handleSelectAgent}
          onSelectConversation={handleSelectConversation}
          isFocused={focusArea === 'sidebar'}
        />

        <Box flexDirection="column" flexGrow={1} padding={1}>
          <Box flexDirection="column" flexGrow={1}>
            <ChatView messages={messages} />
            <StreamRenderer content={streamContent} isStreaming={isStreaming} />
          </Box>

          <InputBar
            onSubmit={handleSubmit}
            onToggleMode={handleToggleMode}
            disabled={status !== 'idle' || focusArea === 'sidebar'}
          />
        </Box>
      </Box>
    </Box>
  );
}
