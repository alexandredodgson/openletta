# Phase 2 Testing Guide

**Date**: 2026-02-17
**Status**: Ready for Live Testing

## Prerequisites

Make sure you have:
- ✅ Node.js 20.x installed
- ✅ Bun 1.3.9+ installed
- ✅ @letta-ai/letta-code authenticated locally
- ✅ A code repository you can use for testing

## How to Run OpenLetta Phase 2

### Step 1: Install Dependencies

```bash
~/.bun/bin/bun install
```

### Step 2: Start the TUI

```bash
~/.bun/bin/bun run dev
```

You should see:
```
╭────────────────────────────────────────────────────────────╮
│ 🤖 agent-<ID>                 ● idle        OpenLetta v0.1 │
╰────────────────────────────────────────────────────────────╯

<input prompt>
>
```

## Testing Scenarios

### Test 1: Bash Tool Rendering

**Goal**: Verify bash output displays correctly with command visible

**Steps**:
1. Send a prompt that triggers bash execution:
   ```
   List the files in src/ directory
   ```

2. Watch for a ToolCallCard to appear with:
   - 🔧 bash [ID: ...] ✓ SUCCESS
   - $ ls -la src/
   - Output lines with file listing
   - "... (X more lines)" if truncated

**Expected Output**:
```
🔧 bash [ID: abc123] ✓ SUCCESS
$ ls -la src/
  1  total 48
  2  drwxr-xr-x  8 user
  3  -rw-r--r--  1 app.tsx
  ...
```

**Pass Criteria**:
- [ ] Command is visible at top
- [ ] Output is properly wrapped
- [ ] Status shows ✓ SUCCESS
- [ ] Tool ID is displayed

---

### Test 2: Read Tool Rendering

**Goal**: Verify file content displays with line numbers

**Steps**:
1. Send a prompt that triggers read execution:
   ```
   Read the file src/App.tsx and show its structure
   ```

2. Watch for a ToolCallCard with FileRead component:
   - 📄 src/App.tsx (TypeScript)
   - Line numbers on the left
   - File content on the right

**Expected Output**:
```
📄 src/App.tsx (TypeScript)
   1  import React from 'react';
   2  import { Box } from 'ink';
   3  import { App } from './App';
   4
  ... (28 more lines)
```

**Pass Criteria**:
- [ ] File path shown
- [ ] Extension correctly identified (TypeScript/Python/JSON/etc)
- [ ] Line numbers are right-aligned
- [ ] Content is readable
- [ ] Truncation shows count of remaining lines

---

### Test 3: Edit Tool Rendering

**Goal**: Verify diff display with color coding

**Steps**:
1. Send a prompt that triggers an edit:
   ```
   Fix the typo in src/App.tsx where it says "componnet" instead of "component"
   ```

2. Watch for a ToolCallCard with FileDiff component:
   - ✏️ src/App.tsx
   - Red lines (deletions) starting with -
   - Green lines (additions) starting with +
   - Cyan hunk markers (@@)

**Expected Output**:
```
✏️ src/App.tsx
@@ -10,5 +10,6 @@
 const App = () => {
-  // This is a componnet
+  // This is a component
   return <Box />;
 };
```

**Pass Criteria**:
- [ ] File path shown
- [ ] Diff format is recognized (@@, +, -)
- [ ] Colors are applied (red/green/cyan)
- [ ] Diff is readable and sensible

---

### Test 4: Write Tool Rendering

**Goal**: Verify file write confirmation with stats

**Steps**:
1. Send a prompt that creates a new file:
   ```
   Create a new utility file at src/utils/helper.ts with a simple function
   ```

2. Watch for a ToolCallCard with FileWrite component:
   - ✍️ src/utils/helper.ts
   - Byte count and line count
   - First 5 lines of content
   - ✓ File written successfully (or error)

**Expected Output**:
```
✍️ src/utils/helper.ts
512 bytes · 18 lines

export function helper() {
  return {
    value: 42,
  };
}
... (13 more lines)

✓ File written successfully
```

**Pass Criteria**:
- [ ] File path shown
- [ ] Byte and line counts reasonable
- [ ] Content preview is visible
- [ ] Success/error status shown

---

### Test 5: Multiple Tools in One Response

**Goal**: Verify all tools render together without layout issues

**Steps**:
1. Send a complex prompt:
   ```
   Read src/App.tsx, show me the structure, then create a test file called src/App.test.tsx with a basic test
   ```

2. Watch for multiple ToolCallCards appearing in sequence:
   - Read operation
   - Write operation (creating test file)

**Expected Output**:
```
🤖 > I'll help you create a test file...

📄 src/App.tsx (TypeScript)
   1  import React...
   ... (more lines)

✍️ src/App.test.tsx
256 bytes · 12 lines
import { render } from 'test-lib';
...
✓ File written successfully
```

**Pass Criteria**:
- [ ] All tools render
- [ ] No overlapping output
- [ ] Layout remains readable
- [ ] All cards properly spaced

---

### Test 6: Error Handling

**Goal**: Verify error status displays correctly

**Steps**:
1. Trigger an error (e.g., read non-existent file):
   ```
   Read the file /nonexistent/path/file.txt
   ```

2. Watch for ToolCallCard with error status:
   - ✗ ERROR (red text)
   - Error message content

**Expected Output**:
```
🔧 Read [ID: xyz] ✗ ERROR
📄 /nonexistent/path/file.txt

✗ Error: File not found
```

**Pass Criteria**:
- [ ] Status shows ✗ ERROR (red)
- [ ] Error message is visible and clear
- [ ] Card still displays properly

---

## Performance Checklist

- [ ] App launches within 2 seconds
- [ ] First message responds within 3 seconds
- [ ] Large file reads (>1000 lines) still responsive
- [ ] Multiple tools in sequence don't lag
- [ ] Terminal scrolling is smooth
- [ ] No memory leaks over 10+ messages

## Compatibility Checklist

- [ ] Works in Terminal.app (macOS)
- [ ] Works in cmd/PowerShell (Windows)
- [ ] Works in bash (Linux)
- [ ] Colors display correctly
- [ ] Box drawing characters render
- [ ] Emoji display properly

## Troubleshooting

### "Raw mode is not supported"
**Cause**: Running in non-interactive terminal
**Solution**: Run in actual terminal or use `bun run dev` interactively

### Colors not showing
**Cause**: Terminal doesn't support ANSI colors
**Solution**: Enable color support in your terminal settings

### Truncation not working
**Cause**: Output exactly at truncation boundary
**Solution**: Test with larger/smaller files

## Success Criteria

✅ Phase 2 is successful if:

1. **All 4 tool types render** (Bash, Read, Edit, Write)
2. **Each has specialized formatting** (colors, line numbers, etc)
3. **Multiple tools display correctly** in one response
4. **Error states show properly** with error messages
5. **Large outputs truncate** with "... (X more lines)" indicator
6. **Layout remains readable** throughout
7. **No TypeScript errors** during execution
8. **Performance is acceptable** (sub-3s responses)

## Reporting Issues

If you find issues:

1. **Capture the scenario** (what prompt triggered it)
2. **Note the terminal** (Terminal.app, iTerm2, etc)
3. **Show expected vs actual** output
4. **Check the console logs** for errors

Example report:
```
## Issue: Colors not showing in FileDiff

**Environment**: macOS, Terminal.app v2.14
**Scenario**: Edit tool rendering
**Expected**: Red (-) and green (+) lines
**Actual**: All white text
**Command**: ~$ ~/.bun/bin/bun run dev
```

## Next Testing Phase

After Phase 2 validation:
1. Collect performance metrics
2. Test with various terminal sizes
3. Test with different LLM responses
4. Gather user feedback
5. Plan Phase 3 (Plan/Build modes)

---

**Ready to test Phase 2! 🚀**

Run: `~/.bun/bin/bun run dev`
Then send test prompts from the list above.
