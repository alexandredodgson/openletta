# SPEC.md — Spécification technique OpenLetta

## Vue d'ensemble

OpenLetta est un terminal UI pour agents Letta. Il utilise `@letta-ai/letta-code` pour accéder à l'API complète des messages Letta et affiche les interactions dans une interface Ink (React pour terminal).

### Phase 1 (complétée)
Implémentation du chat basique avec streaming de réponses textuelles.

### Phase 2 (en préparation)
Migration vers `@letta-ai/letta-code` pour accéder aux types de messages détaillés (reasoning, tool_call, tool_return) et rendu riche des outils.

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
- ✅ ChatView affiche placeholders pour Phase 2
- ✅ Types centralisés dans `src/types/letta.ts`

### Fonctions principales

```typescript
import { Letta } from '@letta-ai/letta-code';

// Initialiser le client
const client = new Letta({
  // auth auto-détectée depuis ~/.letta config
});

// Accéder aux agents
const agents = client.agents;
const agent = await agents.get(agentId);
const agentNew = await agents.create(config);

// Streamer les messages
const stream = agents.messages.stream(agentId, conversationId, {
  messages: [{ role: 'user', content: 'Hello' }]
});

for await (const msg of stream) {
  console.log(msg.message_type); // 'reasoning_message', 'tool_call_message', etc.
}
```

### prompt(text, agentId?)

One-shot. Envoie un prompt et attend le résultat complet.

```typescript
const result = await prompt('What is 2 + 2?');
// result: { success: boolean, result?: string, error?: string, durationMs: number }

const result2 = await prompt('Run: echo hello', agentId);
```

### createSession(agentId?, options?)

Crée une nouvelle session (conversation). Si pas d'agentId, utilise le LRU agent ou en crée un nouveau.

```typescript
const session = createSession();
// ou
const session = createSession(agentId);
// ou
const session = createSession(agentId, {
  permissionMode: 'bypassPermissions',  // 'bypassPermissions' | 'default'
  allowedTools: ['Bash', 'Glob', 'Read', 'Edit', 'Write'],
  cwd: '/path/to/project',
  systemPrompt: 'You are a helpful assistant.',
  // ou systemPrompt: { type: 'preset', preset: 'letta-claude', append: '...' }
});
```

**Propriétés de session :**
- `session.agentId` — ID de l'agent
- `session.conversationId` — ID de la conversation
- `session.send(text)` — envoie un message
- `session.stream()` — AsyncIterable des messages
- `session.close()` — ferme la session

### resumeSession(id)

Reprend une session existante. Accepte un agentId ou un conversationId (format `conv-xxx`).

```typescript
await using session = resumeSession(agentId);
// ou
await using session = resumeSession(conversationId); // auto-détecte conv-xxx
```

### createAgent(options?)

Crée un nouvel agent avec configuration custom.

```typescript
const agentId = await createAgent();
// ou
const agentId = await createAgent({
  model: 'claude-sonnet-4',
  systemPrompt: 'You are a Python expert.',
  memory: [
    { label: 'persona', value: 'You are a senior developer' },
    { label: 'project', value: 'FastAPI backend' }
  ]
});
```

### Types de messages dans le stream (Phase 2+)

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

### Flux standard d'utilisation

```typescript
// 1. Créer ou reprendre une session
const session = createSession();

// 2. Envoyer un message
await session.send('Hello, fix the bug in auth.py');

// 3. Lire le stream
for await (const msg of session.stream()) {
  switch (msg.type) {
    case 'assistant':
      // Afficher le texte dans le chat
      process.stdout.write(msg.content);
      break;
    case 'result':
      // Fin de la réponse
      console.log(`Done in ${msg.durationMs}ms`);
      break;
  }
}

// 4. Envoyer un autre message (multi-turn)
await session.send('Now add tests for it');
for await (const msg of session.stream()) { /* ... */ }

// 5. Fermer
session.close();
```

### Persistance de l'agent

- L'agent persiste entre les sessions (mémoire, personality, skills)
- Chaque conversation a son propre historique de messages
- Plusieurs conversations peuvent tourner en parallèle sur le même agent
- `/clear` vide l'affichage mais PAS la mémoire
- `/new` crée une nouvelle conversation (garde la mémoire agent)

## Architecture OpenLetta — Composants Phase 2

### Hooks

- **useLettaSession.ts**: Wrapper `createSessionWrapper()` qui initialise le client Letta et expose une API compatible
- **useStream.ts**: Consomme le stream et agrège les messages par type (reasoning, toolCalls, toolReturns)

### Types

- **src/types/letta.ts**: Définitions TypeScript centralisées pour tous les types de messages

### Composants (Phase 1)

- **ChatView.tsx**: Affiche l'historique des messages + placeholders pour tools
- **StreamRenderer.tsx**: Affiche le contenu en cours de streaming
- **InputBar.tsx**: Input utilisateur
- **StatusBar.tsx**: Informations agent + statut

### Composants Phase 2 (à implémenter)

- **ToolCallCard.tsx**: Container générique pour un appel outil
- **BashOutput.tsx**: Rendu Bash avec couleurs ANSI
- **FileRead.tsx**: Lecture de fichier avec syntax highlighting
- **FileDiff.tsx**: Diff avec colorisation +/-
- **FileWrite.tsx**: Opération d'écriture avec preview

## Interface OpenCode — Features à reproduire (par phase)

### Phase 1 (MVP) — Chat + Streaming

Ce qu'on reproduit d'OpenCode :
- Zone de chat scrollable avec historique des messages
- Distinction visuelle user / assistant
- Input multiline en bas du terminal
- Indicateur de statut (idle / thinking / streaming)
- Raccourcis : Ctrl+C pour quitter, Enter pour envoyer

Ce qu'on ne fait PAS encore :
- Rendu des tool calls
- Modes plan/build
- Multi-session
- Sidebar
- Fuzzy search fichiers
- Slash commands

### Phase 2 — Rendu des tool calls

- Afficher les appels Bash/Read/Edit avec rendu riche
- Diffs colorés pour les éditions de fichiers
- Sortie ANSI pour Bash
- Nécessite : passer au `@letta-ai/letta-client` pour avoir les tool_call_message

### Phase 3 — Modes Plan/Build

- Tab pour switcher entre Plan (lecture seule) et Build (modification)
- Plan = allowedTools restreint (pas d'Edit, Write, Bash exécutant)
- Build = tous les outils autorisés
- Indicateur de mode dans la status bar

### Phase 4 — Multi-session & sidebar

- Sidebar navigable avec liste des conversations
- Créer / switcher / supprimer des conversations
- Toutes les conversations partagent la mémoire agent

### Phase 5 — Référencement fichiers

- @ pour fuzzy search de fichiers dans le cwd
- Injection de contenu de fichier dans le prompt

### Phase 6 — Slash commands

- /init, /remember, /model, /memory, /agent, /config
- Dispatch vers les API Letta appropriées

### Phase 7 — Share & polish

- Liens partageables
- Thèmes
- Keybindings configurables
- Système de permissions (approve/deny tool calls)

### Phase 8 — Distribution

- npm package global
- Desktop app (Tauri)
- Extension VSCode
