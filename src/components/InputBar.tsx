/**
 * InputBar.tsx — User input field at the bottom of the terminal.
 *
 * Props:
 * - onSubmit: (text: string) => void — called when user presses Enter
 * - disabled: boolean — true while streaming/thinking (prevents input)
 *
 * Behavior:
 * - Text input field at the bottom of the terminal
 * - Enter to submit, Shift+Enter for newline (if multiline needed)
 * - Clears input after submit
 * - Shows a prompt character (e.g., "> ") before the input
 * - When disabled, shows a dimmed placeholder like "Waiting for response..."
 *
 * Implementation:
 * - Use Ink's TextInput component (from 'ink-text-input' or Ink 5 built-in)
 * - Or use useInput hook for custom key handling
 */

import React from 'react';
import { Box, Text } from 'ink';

interface InputBarProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSubmit, disabled }: InputBarProps): React.ReactElement {
  // TODO: implement with useInput or ink-text-input
  return (
    <Box borderStyle="single" borderColor={disabled ? 'gray' : 'green'} paddingX={1}>
      <Text dimColor={disabled}>{disabled ? 'Waiting for response...' : '> Type a message...'}</Text>
    </Box>
  );
}
