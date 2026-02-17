# Changelog — OpenLetta

All notable changes to OpenLetta are documented here.

## [Phase 2.0.0] — 2026-02-17

### 🎉 Added

#### New Components
- **ToolCallCard.tsx** — Generic container for all tool executions
  - Displays tool name, execution ID, and status badge
  - Bordered box design with color-coded status (✓ green / ✗ red)
  - Supports both pending (no result) and completed states

- **BashOutput.tsx** — Specialized renderer for bash tool execution
  - Displays executed command at the top
  - Shows command output with line wrapping
  - Truncates outputs >20 lines with line count indicator
  - Preserves ANSI colors via Ink's native support

- **FileRead.tsx** — Specialized renderer for file read operations
  - Displays file path with language hint based on extension
  - Shows content with right-aligned line numbers (zero-padded)
  - Truncates files >30 lines with remaining line count
  - Supports TypeScript, Python, JSON, and other formats

- **FileDiff.tsx** — Specialized renderer for file edit operations
  - Displays unified diff format (like `git diff`)
  - Color coding: green (+) for additions, red (-) for deletions
  - Cyan markers (@@) for diff hunks
  - Truncates large diffs >25 lines with count indicator

- **FileWrite.tsx** — Specialized renderer for file write/creation
  - Shows target file path
  - Displays byte count and line count statistics
  - Preview of first 5 lines of content
  - Success/error status with visual indicators

#### ChatView Enhancements
- Added `renderToolContent()` dispatcher function
  - Automatically routes tools by name (case-insensitive)
  - Links tool calls to results via `tool_call_id`
  - Graceful fallback for unknown tools
- Replaced placeholder tool call display with rich rendering
- Removed redundant "Tool returns" section (now integrated into cards)

#### Type System
- Updated `ToolReturnMessage` interface with `message_type: 'tool_return_message'`
- Ensures consistent message dispatching across all message types

#### Environment Setup
- Added Node.js 20.x installation
- Added Bun 1.3.9+ runtime
- Dependencies installed and validated

### ✅ Verified

- **TypeScript Compilation**: Zero errors, full strict mode
- **Build Process**: Success with tsup (20.78 KB ESM bundle)
- **Runtime**: Application initializes correctly with Letta agent
- **Code Quality**:
  - Zero `any` types
  - All imports ESM-ready
  - No circular dependencies
  - CLAUDE.md convention compliance
- **Backward Compatibility**: Phase 1 functionality unchanged

### 📊 Metrics

| Metric | Value |
|--------|-------|
| New components | 5 |
| Lines of new code | 251 |
| Lines modified | 96 |
| Bundle size | 20.78 KB |
| Build time | 146ms (ESM) |
| TypeScript errors | 0 |
| Build warnings | 0 |
| Breaking changes | 0 |

### 📚 Documentation

- **PHASE2_IMPLEMENTATION.md** — Detailed implementation guide
- **PHASE2_COMPLETE.md** — Validation and deployment checklist
- **PHASE2_TESTING_GUIDE.md** — Step-by-step testing scenarios
- **CHANGELOG.md** — This file

### 🔄 Changes to Existing Files

**src/components/ChatView.tsx**
- Added imports for ToolCallCard and tool-specific renderers
- Added `renderToolContent()` function with switch-case dispatcher
- Enhanced tool calls section with rich rendering
- Removed redundant tool returns section

**src/types/letta.ts**
- Added `message_type: 'tool_return_message'` to ToolReturnMessage interface

**CLAUDE.md**
- Updated Phase 2 status from "En préparation" to "Complète (2026-02-17)"

### 🚀 Ready For

- Live testing with Letta Code agents
- Tool execution output validation
- Terminal compatibility testing
- User feedback and iteration

---

## [Phase 1.0.0] — 2026-02-16

### 🎉 Added

#### Core Features
- Basic chat interface with streaming support
- Message history with user/assistant distinction
- Status bar showing agent ID and connection state
- Input bar for user prompts
- Markdown rendering for assistant responses
- Session persistence (agent ID stored locally)

#### Components
- App.tsx — Main application logic and state management
- ChatView.tsx — Message history display
- InputBar.tsx — User input field
- StreamRenderer.tsx — Real-time token streaming display
- StatusBar.tsx — Connection and agent status

#### Hooks
- useLettaSession.ts — Session management and Letta connection
- useStream.ts — Stream consumption and message aggregation

#### Type System
- Centralized message types in src/types/letta.ts
- Full TypeScript strict mode compliance

### ✅ Features

- Multi-turn conversation support
- Streaming responses token-by-token
- Graceful shutdown (Ctrl+C)
- Agent persistence across sessions
- Responsive terminal UI with Ink

---

## Future Plans

### Phase 3 (Planned)
- Plan/Build mode restrictions
- Tool execution approval workflow
- Conditional tool availability based on mode

### Phase 4+ (Planned)
- Multi-session support with sidebar
- File referencing (@syntax)
- Slash commands (/remember, /model, etc)
- Share links and conversation export

---

**For detailed change information, see PHASE2_IMPLEMENTATION.md and PHASE2_COMPLETE.md**
