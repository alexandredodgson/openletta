# SPEC.md — Spécification technique OpenLetta

## Vue d'ensemble

OpenLetta est un terminal UI pour agents Letta. Il utilise `@letta-ai/letta-code` pour accéder à l'API complète des messages Letta et affiche les interactions dans une interface Ink (React pour terminal).

### Phase 1 (complétée)
Implémentation du chat basique avec streaming de réponses textuelles.

### Phase 2 (complétée)
Migration vers `@letta-ai/letta-code` pour accéder aux types de messages détaillés (reasoning, tool_call, tool_return) et rendu riche des outils.

### Phase 3 (en cours)
Introduction des modes Plan et Build pour contrôler les permissions d'exécution de l'agent.

## Letta Code — API Reference

Le package npm `@letta-ai/letta-code` expose l'API complète du serveur Letta, permettant l'accès à tous les types de messages (reasoning, tool_call, tool_return, etc.).

### Migration de letta-code-sdk à letta-code

**Différences clés:**

| Aspect | letta-code-sdk | letta-code |
|--------|-----------------|-----------|
| **Types de messages** | Limité (assistant, result) | Complet (6 types) |
| **Tool calls** | Abstraits | Exposés (avec arguments) |
| **Tool returns** | Non disponibles | Complètement disponibles |
| **Reasoning** | Non exposé | Accessible en temps réel |
| **Use case** | Chat simple | Interactions complexes, debugging |

**Migration impact:**
- ✅ Backward compatible (même interface de base)
- ✅ Accès aux nouveaux types via le stream
- ✅ ChatView affiche le rendu riche des outils
- ✅ Types centralisés dans `src/types/letta.ts`

### Fonctions principales (Session Wrapper)

```typescript
import { Letta } from '@letta-ai/letta-code';

// Initialiser le client
const client = new Letta({
  // auth auto-détectée depuis ~/.letta config
});

// Le wrapper de session (useLettaSession) expose :
// - session.agentId
// - session.conversationId
// - session.send(text)
// - session.stream() -> AsyncIterable<LettaMessage>
// - session.close()
```

### Types de messages dans le stream

Voir `docs/MESSAGE_TYPES.md` pour la documentation complète.

Les 6 types disponibles via `@letta-ai/letta-code`:

```typescript
interface UserMessage {
  message_type: 'user_message';
  content: string;
}

interface ReasoningMessage {
  message_type: 'reasoning_message';
  content: string;
}

interface AssistantMessage {
  message_type: 'assistant_message';
  content: string;
}

interface ApprovalRequestMessage {
  message_type: 'approval_request_message';
  tool_call: {
    tool_call_id: string;
    tool_name: string;
    arguments: Record<string, unknown>;
  };
}

interface ToolReturnMessage {
  message_type: 'tool_return_message';
  tool_call_id: string;
  tool_name: string;
  status: 'success' | 'error';
  result: string;
}

interface UsageStatistics {
  message_type: 'usage_statistics';
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
}

type LettaMessage = UserMessage | ReasoningMessage | AssistantMessage
                  | ApprovalRequestMessage | ToolReturnMessage | UsageStatistics;
```

## Architecture OpenLetta — Composants Phase 2 & 3

### Hooks

- **useLettaSession.ts**: Gère la connexion au SDK Letta et le cycle de vie de la session.
- **useStream.ts**: Consomme le stream et agrège les messages pour l'affichage (reasoning, toolCalls, toolReturns).

### Types

- **src/types/letta.ts**: Définitions TypeScript centralisées, incluant les types de messages et les modes de l'application.

### Composants

- **ChatView.tsx**: Historique des messages avec rendu riche des outils (Bash, Read, Edit, Write).
- **StatusBar.tsx**: Informations sur l'agent, l'état de l'application et le mode actuel (Plan/Build).
- **InputBar.tsx**: Saisie utilisateur avec support du multi-ligne et gestion des raccourcis.
- **ToolCallCard.tsx**: Container visuel pour les appels d'outils.

## Interface OpenCode — Features à reproduire (par phase)

### Phase 3 — Modes Plan/Build

- **Tab** pour switcher entre Plan (lecture seule) et Build (modification).
- **Mode Plan** : `allowedTools` restreint ou blocage client des outils `Edit`, `Write`, `Bash`.
- **Mode Build** : tous les outils autorisés.
- **Indicateur de mode** dans la status bar.

### Phase 4 — Multi-session & sidebar

- Sidebar navigable avec liste des conversations.
- Créer / switcher / supprimer des conversations.
- Toutes les conversations partagent la mémoire agent.

### Phase 5 — Référencement fichiers

- **@** pour fuzzy search de fichiers dans le cwd.
- Injection de contenu de fichier dans le prompt.

### Phase 6 — Slash commands

- `/init`, `/remember`, `/model`, `/memory`, `/agent`, `/config`.

### Phase 7 — Share & polish

- Liens partageables, thèmes, keybindings configurables, permissions.

### Phase 8 — Distribution

- npm package, Desktop app (Tauri), VSCode extension.
