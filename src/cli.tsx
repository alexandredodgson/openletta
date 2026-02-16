import { render } from 'ink';
import React from 'react';
import { App } from './App.js';

const args = process.argv.slice(2);
let agentId: string | undefined;
let forceNew = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--agent' && i + 1 < args.length) {
    agentId = args[i + 1];
    i++;
  } else if (args[i] === '--new') {
    forceNew = true;
  }
}

render(<App initialAgentId={agentId} forceNew={forceNew} />);
