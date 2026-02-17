import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Agent, Conversation } from '../types/letta.js';

interface SidebarProps {
  agents: Agent[];
  conversations: Conversation[];
  selectedAgentId: string;
  selectedConversationId: string;
  onSelectAgent: (id: string) => void;
  onSelectConversation: (id: string) => void;
  isFocused: boolean;
}

export function Sidebar({
  agents,
  conversations,
  selectedAgentId,
  selectedConversationId,
  onSelectAgent,
  onSelectConversation,
  isFocused,
}: SidebarProps): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const totalItems = agents.length + conversations.length;

  // Keep index in bounds when lists change
  useEffect(() => {
    if (selectedIndex >= totalItems && totalItems > 0) {
      setSelectedIndex(totalItems - 1);
    }
  }, [totalItems, selectedIndex]);

  useInput((_, key) => {
    if (!isFocused) return;

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (key.return) {
      if (selectedIndex < agents.length) {
        onSelectAgent(agents[selectedIndex].id);
      } else {
        onSelectConversation(conversations[selectedIndex - agents.length].id);
      }
    }
  });

  return (
    <Box
      flexDirection="column"
      width="25%"
      height="100%"
      borderStyle="single"
      borderColor={isFocused ? 'blue' : 'gray'}
      paddingX={1}
    >
      <Text bold color="yellow">AGENTS</Text>
      {agents.map((agent, index) => {
        const isSelected = index === selectedIndex;
        const isActive = agent.id === selectedAgentId;
        return (
          <Box key={agent.id}>
            <Text color={isSelected ? 'cyan' : isActive ? 'white' : 'gray'}>
              {isSelected ? '> ' : '  '}
              {agent.name || agent.id.slice(0, 8)}
            </Text>
          </Box>
        );
      })}

      <Box marginTop={1}>
        <Text bold color="yellow">CONVERSATIONS</Text>
      </Box>
      {conversations.map((conv, index) => {
        const itemIndex = index + agents.length;
        const isSelected = itemIndex === selectedIndex;
        const isActive = conv.id === selectedConversationId;
        return (
          <Box key={conv.id}>
            <Text color={isSelected ? 'cyan' : isActive ? 'white' : 'gray'}>
              {isSelected ? '> ' : '  '}
              {conv.name || conv.id.slice(0, 8)}
            </Text>
          </Box>
        );
      })}

      <Box marginTop="auto">
        <Text dimColor size="small">
          {isFocused ? 'Arrows to navigate\nEnter to select' : 'Ctrl+S to focus'}
        </Text>
      </Box>
    </Box>
  );
}
