/**
 * commands.ts — Parser and handler for slash commands.
 */

export interface CommandAction {
  type: 'agent' | 'session' | 'memory' | 'config' | 'help' | 'export' | 'unknown';
  payload?: string;
}

/**
 * parseCommand - Parses a user input string into a command action.
 */
export function parseCommand(text: string): CommandAction {
  const parts = text.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const payload = parts.slice(1).join(' ');

  switch (command) {
    case '/agent':
      return { type: 'agent', payload };
    case '/session':
      return { type: 'session', payload };
    case '/memory':
      return { type: 'memory' };
    case '/config':
      return { type: 'config' };
    case '/help':
      return { type: 'help' };
    case '/export':
      return { type: 'export' };
    default:
      return { type: 'unknown' };
  }
}

/**
 * getHelpText - Returns formatted help text for all commands.
 */
export function getHelpText(): string {
  return `
Available Commands:
  /agent <id>    - Switch to a different agent
  /session <id>  - Switch to a different conversation/session
  /memory        - Show current agent core memory
  /config        - Show current session configuration
  /export        - Export chat history to chat-export.json
  /help          - Show this help message

Keyboard Shortcuts:
  Ctrl+S         - Toggle focus between Sidebar and Chat
  Tab            - Toggle Mode (PLAN / BUILD)
  Enter          - Send message
`;
}
