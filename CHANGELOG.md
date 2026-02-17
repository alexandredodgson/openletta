# Changelog — OpenLetta

All notable changes to OpenLetta are documented here.

## [Phase 5-8.0.0] — 2026-02-17

### 🎉 Added

- **File Referencing (@)**: Users can now reference files in their prompts using the `@filename` syntax. The content of the file is automatically injected into the message.
- **Slash Commands**: Added support for commands:
  - `/agent <id>` - Switch to a different agent.
  - `/session <id>` - Switch to a different conversation.
  - `/memory` - Display the agent's current core memory.
  - `/config` - Show the current session configuration.
  - `/export` - Export chat history to `chat-export.json`.
  - `/help` - Show available commands and keyboard shortcuts.
- **Enhanced Status Bar**: Added a 'processing' state to indicate local operations like file reading or command execution.
- **Distribution Support**:
  - Added shebang (`#!/usr/bin/env bun`) to `cli.tsx`.
  - Configured `bin` field in `package.json` for global installation (`openletta`).

### 🛠 Fixed & Improved

- Updated `LettaSessionWrapper` to support memory retrieval.
- Improved error handling for file reading and command execution.
- Updated Roadmap and project documentation.

## [Phase 3-4.0.0] — 2026-02-17

### 🎉 Added

- **Modes Plan / Build**:
  - Toggle between Plan (Read-Only) and Build (Full Access) modes using `Tab`.
  - Client-side and server-side tool restrictions in Plan mode.
- **Multi-session & Sidebar**:
  - New Sidebar component for navigating agents and conversations.
  - Focus toggle between Sidebar and Chat using `Ctrl+S`.
  - Persistence of selected agent and conversation via `conf`.

## [Phase 2.0.0] — 2026-02-17
[Rest of previous changelog...]
