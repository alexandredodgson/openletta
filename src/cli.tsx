import { render } from 'ink';
import React from 'react';
import { App } from './App.js';
import type { AppMode } from './types/letta.js';

const args = process.argv.slice(2);
let agentId: string | undefined;
let forceNew = false;
let mode: AppMode | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--agent' && i + 1 < args.length) {
    agentId = args[i + 1];
    i++;
  } else if (args[i] === '--new') {
    forceNew = true;
  } else if (args[i] === '--mode' && i + 1 < args.length) {
    const requestedMode = args[i + 1].toLowerCase();
    if (requestedMode === 'plan' || requestedMode === 'build') {
      mode = requestedMode as AppMode;
    }
    i++;
  }
}

render(<App initialAgentId={agentId} forceNew={forceNew} initialMode={mode} />);
