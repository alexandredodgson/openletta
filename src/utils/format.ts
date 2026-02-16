/**
 * format.ts — Text formatting utilities for terminal display.
 *
 * Phase 1: Basic formatting
 * - renderMarkdown(text) → formatted string for terminal
 *   Uses marked + marked-terminal for basic MD rendering
 *
 * Phase 2+: Rich rendering
 * - renderDiff(before, after) → colored diff
 * - renderBashOutput(output) → with ANSI colors preserved
 * - highlightCode(code, language) → syntax highlighted
 */

// TODO Phase 1: implement renderMarkdown using marked + marked-terminal
// import { marked } from 'marked';
// import TerminalRenderer from 'marked-terminal';

export function renderMarkdown(text: string): string {
  // Placeholder — for MVP, return text as-is
  // Implement with marked-terminal for Phase 1 polish
  return text;
}
