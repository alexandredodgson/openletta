# OpenLetta

> A rich terminal UI for [Letta Code](https://github.com/letta-ai/letta-code) agents, inspired by [OpenCode](https://github.com/anomalyco/opencode).

OpenLetta combines the **stateful agent** capabilities of Letta Code (persistent memory, skills, subagents) with a polished terminal interface inspired by OpenCode (TUI, LSP, multi-session, rich tool rendering).

## Objectif global

Créer une interface complète pour agents Letta Code qui combine :
- **La puissance de Letta Code** : mémoire persistante, exécution d'outils locaux, skills, subagents
- **L'UX d'OpenCode** : rendu riche des outils, modes plan/build, multi-session, navigation fluide
- **Une application desktop moderne** : interface visuelle élégante et accessible (comme OpenCode)
- **Multi-plateforme** : déployable en CLI, TUI terminal, et app desktop selon les besoins

L'objectif est d'offrir la meilleure expérience possible pour interagir avec des agents IA stateful, que ce soit en ligne de commande pour les power users ou via une interface graphique pour un usage quotidien.

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
