# Letta Message Types — Complete Reference

## Overview

Letta Code streams messages in real-time as the agent thinks, reasons, and executes tools. This document describes all message types and their usage in OpenLetta.

## Message Flow

A typical agent interaction follows this sequence:

```
User Input
    ↓
[user_message]
    ↓
[reasoning_message] ← Agent thinks step-by-step
    ↓
[approval_request_message] ← Agent wants to execute tool
    ↓
[tool_return_message] ← Tool executed, result available
    ↓
[reasoning_message] ← Agent reasons about result
    ↓
[assistant_message] ← Final response
    ↓
[usage_statistics] ← Token counts
```

## Message Types

### 1. user_message

**When sent**: At the start of an interaction, sent by the client.

**TypeScript**:
```typescript
{
  message_type: 'user_message';
  content: string;
  timestamp?: string;
}
```

**Example**:
```json
{
  "message_type": "user_message",
  "content": "What files are in the current directory?",
  "timestamp": "2026-02-17T10:30:00Z"
}
```

### 2. reasoning_message

**When sent**: Agent is thinking through the problem internally. May appear multiple times.

**TypeScript**:
```typescript
{
  message_type: 'reasoning_message';
  content: string;
  timestamp?: string;
}
```

**Example**:
```json
{
  "message_type": "reasoning_message",
  "content": "The user wants to list files. I should run 'ls' in the current directory to get this information.",
  "timestamp": "2026-02-17T10:30:01Z"
}
```

**UI Treatment**: Display in italics or dimmed color to indicate internal thought process.

### 3. approval_request_message

**When sent**: Agent wants to execute a tool (e.g., Bash command, file read, file write).

**TypeScript**:
```typescript
{
  message_type: 'approval_request_message';
  tool_call: {
    tool_call_id: string;
    tool_name: string;
    arguments: Record<string, unknown>;
  };
  timestamp?: string;
}
```

**Example** (Bash execution):
```json
{
  "message_type": "approval_request_message",
  "tool_call": {
    "tool_call_id": "call_abc123",
    "tool_name": "bash",
    "arguments": {
      "command": "ls -la /home/user"
    }
  }
}
```

**Example** (File read):
```json
{
  "message_type": "approval_request_message",
  "tool_call": {
    "tool_call_id": "call_def456",
    "tool_name": "read_file",
    "arguments": {
      "file_path": "/home/user/README.md"
    }
  }
}
```

**Phase 2 UI**: Render as `ToolCallCard` with tool name, arguments, and status badge.

### 4. tool_return_message

**When sent**: Tool execution completed with result.

**TypeScript**:
```typescript
{
  message_type: 'tool_return_message';
  tool_call_id: string;
  tool_name: string;
  status: 'success' | 'error';
  result: string;
  timestamp?: string;
}
```

**Example** (Success):
```json
{
  "message_type": "tool_return_message",
  "tool_call_id": "call_abc123",
  "tool_name": "bash",
  "status": "success",
  "result": "total 48\ndrwxr-xr-x  5 user staff  160 Feb 17 10:25 .\ndrwxr-xr-x+ 22 user staff  704 Feb 17 09:00 ..\n-rw-r--r--  1 user staff 1234 Feb 10 15:30 README.md"
}
```

**Example** (Error):
```json
{
  "message_type": "tool_return_message",
  "tool_call_id": "call_def456",
  "tool_name": "bash",
  "status": "error",
  "result": "bash: cd: /nonexistent: No such file or directory"
}
```

**Phase 2 UI**: Render exit code, stderr, stdout with ANSI color preservation.

### 5. assistant_message

**When sent**: Agent's final response to the user.

**TypeScript**:
```typescript
{
  message_type: 'assistant_message';
  content: string;
  timestamp?: string;
}
```

**Example**:
```json
{
  "message_type": "assistant_message",
  "content": "The current directory contains 5 files, including README.md. Here's what I found:\n\n- README.md (1234 bytes)\n- src/ (directory)\n- tests/ (directory)\n- package.json\n- tsconfig.json"
}
```

**UI Treatment**: Render with markdown formatting. This is the message shown to the user.

### 6. usage_statistics

**When sent**: At the end of the interaction, includes token counts.

**TypeScript**:
```typescript
{
  message_type: 'usage_statistics';
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
}
```

**Example**:
```json
{
  "message_type": "usage_statistics",
  "input_tokens": 42,
  "output_tokens": 156,
  "total_tokens": 198
}
```

**UI Treatment**: Display in status bar or as dimmed footer (optional).

## Supported Tools

### bash

Execute shell commands (Bash, Zsh, etc.).

**Arguments**:
- `command` (string): The shell command to execute

**Returns**: stdout + stderr combined, with exit code

### read_file

Read contents of a file.

**Arguments**:
- `file_path` (string): Path to the file

**Returns**: File contents as string

### write_file

Create or overwrite a file.

**Arguments**:
- `file_path` (string): Path where file should be written
- `content` (string): File contents

**Returns**: Confirmation + file size

### edit_file

Replace specific text in a file (find + replace).

**Arguments**:
- `file_path` (string): Path to file
- `old_string` (string): Text to find
- `new_string` (string): Replacement text

**Returns**: Confirmation + diff preview

## Message Capture in OpenLetta

### In useStream.ts

The `useStream` hook processes messages and aggregates them into a `DisplayMessage`:

```typescript
interface StreamState {
  assistantContent: string;
  reasoning: string[];
  toolCalls: ToolCallMessage[];
  toolReturns: ToolReturnMessage[];
}
```

### In App.tsx

Messages are added to history with full structured data:

```typescript
const fullMessage = await startStream(session.stream());
// fullMessage = {
//   role: 'assistant',
//   content: assistantContent,
//   reasoning?: string[],
//   toolCalls?: ToolCallMessage[],
//   toolReturns?: ToolReturnMessage[]
// }
setMessages(prev => [...prev, fullMessage]);
```

### In ChatView.tsx

Phase 1: Display only `content` (backward compatible)
Phase 2: Render reasoning, toolCalls, toolReturns with rich components

## Phase 2 Rendering

### ToolCallCard

Generic container for a tool call:
```
┌─ Bash (pending) ─────────────────────┐
│ command: "ls -la /home/user"          │
│ [████░░░░░░] 45% | 2.3s elapsed      │
└───────────────────────────────────────┘
```

### Specialized Components

- **BashOutput.tsx**: Command + stdout (ANSI colors) + stderr + exit code
- **FileRead.tsx**: File path + content with syntax highlighting
- **FileDiff.tsx**: Unified or side-by-side diff with +/- colors
- **FileWrite.tsx**: File path + operation type + size preview

## Error Handling

If a tool fails:
1. `approval_request_message` arrives with tool details
2. Tool execution happens server-side
3. `tool_return_message` arrives with `status: 'error'` and error message
4. Agent can reason about the error and retry or choose alternative approach
5. No client-side approval/rejection needed (server-side execution)

## Examples

### Example 1: List Files

```
User > What's in the current directory?

💭 Reasoning: I'll list the files using ls.

[approval_request_message]
  bash: ls -la

[tool_return_message]
  total 48
  drwxr-xr-x  5 user staff   160 Feb 17 10:25 .
  -rw-r--r--  1 user staff  1234 Feb 10 15:30 README.md
  -rw-r--r--  1 user staff  2048 Feb 10 15:30 package.json

🤖 > Here are the files in the current directory:
  - README.md (1234 bytes)
  - package.json (2048 bytes)
  ...
```

### Example 2: Read and Process File

```
User > Fix the broken import in src/App.tsx

💭 Reasoning: Let me read the file first to see what's wrong.

[approval_request_message]
  read_file: src/App.tsx

[tool_return_message]
  ... file contents ...

💭 Reasoning: I see the issue. The import path is incorrect. Let me fix it.

[approval_request_message]
  edit_file: src/App.tsx (old -> new)

[tool_return_message]
  Success: import updated

🤖 > I fixed the broken import. Changed:
  from: import { foo } from './components'
  to: import { foo } from './components/index.ts'
```

## References

- Letta Code Docs: https://docs.letta.com/letta-code
- OpenLetta Repository: https://github.com/yourusername/openletta
- Phase 2 Design: See open.txt for detailed Phase 2 component architecture
