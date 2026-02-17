/**
 * InputBar.tsx — User input field at the bottom of the terminal.
 *
 * Props:
 * - onSubmit: (text: string) => void — called when user presses Enter
 * - onToggleMode: () => void — called when user presses Tab
 * - disabled: boolean — true while streaming/thinking (prevents input)
 *
 * Behavior:
 * - Text input field at the bottom of the terminal
 * - Enter to submit, Shift+Enter for newline (if multiline needed)
 * - Tab to toggle mode (Plan/Build)
 * - Clears input after submit
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface InputBarProps {
  onSubmit: (text: string) => void;
  onToggleMode?: () => void;
  disabled?: boolean;
}

export function InputBar({ onSubmit, onToggleMode, disabled }: InputBarProps): React.ReactElement {
  const [input, setInput] = useState('');

  useInput((inputChar, key) => {
    if (disabled) return;

    if (key.return) {
      // Submit on Enter
      if (input.trim()) {
        onSubmit(input);
        setInput('');
      }
    } else if (key.tab) {
      // Toggle mode on Tab
      onToggleMode?.();
    } else if (key.backspace || key.delete) {
      // Handle backspace
      setInput((prev) => prev.slice(0, -1));
    } else if (!key.ctrl && !key.meta && inputChar) {
      // Add character to input
      setInput((prev) => prev + inputChar);
    }
  });

  return (
    <Box borderStyle="single" borderColor={disabled ? 'gray' : 'green'} paddingX={1}>
      {disabled ? (
        <Text dimColor>Waiting for response...</Text>
      ) : (
        <>
          <Text color="cyan">&gt; </Text>
          <Text>{input}</Text>
          <Text color="gray">▊</Text>
        </>
      )}
    </Box>
  );
}
