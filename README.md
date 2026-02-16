# OpenLetta

> A rich terminal UI for [Letta Code](https://github.com/letta-ai/letta-code) agents, inspired by [OpenCode](https://github.com/anomalyco/opencode).

OpenLetta combines the **stateful agent** capabilities of Letta Code (persistent memory, skills, subagents) with a polished terminal interface inspired by OpenCode (TUI, LSP, multi-session, rich tool rendering).

## Status

🚧 **Early development** — Phase 1 (Chat + Streaming MVP)

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Letta Code](https://docs.letta.com/letta-code) installed and authenticated:
  ```bash
  npm i -g @letta-ai/letta-code
  letta  # follow auth prompts, then Ctrl+C
  ```

## Getting started

```bash
git clone <repo-url> && cd openletta
bun install
bun run dev
```

## Architecture

OpenLetta is **purely a UI layer**. All agent logic, memory, tool execution, and model management is handled by the Letta Code SDK.

See [SPEC.md](./SPEC.md) for technical details and [ROADMAP.md](./ROADMAP.md) for the build plan.

## License

MIT
