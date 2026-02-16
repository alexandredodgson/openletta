#!/usr/bin/env bun
/**
 * OpenLetta CLI entry point.
 *
 * Usage:
 *   bun run src/cli.tsx
 *   openletta              (after global install)
 *   openletta --agent <id> (resume specific agent)
 *   openletta --new        (force new agent)
 */

import { render } from 'ink';
import React from 'react';
import { App } from './App.js';

// TODO Phase 1: parse CLI args (--agent, --new, --cwd)
// For now, just launch the app with defaults.

render(<App />);
