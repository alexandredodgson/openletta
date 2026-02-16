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

import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

// Configure marked to use terminal renderer
marked.setOptions({
  renderer: new TerminalRenderer() as any,
});

export function renderMarkdown(text: string): string {
  try {
    return marked.parse(text) as string;
  } catch (error) {
    // Fallback to raw text if parsing fails
    return text;
  }
}
