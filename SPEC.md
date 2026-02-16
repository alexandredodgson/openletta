# SPEC.md — Spécification technique OpenLetta

## Vue d'ensemble

OpenLetta est un terminal UI pour agents Letta. Il wrappe le `@letta-ai/letta-code-sdk` et affiche les interactions dans une interface Ink (React pour terminal).

## Letta Code SDK — API Reference

Le SDK est le package npm `@letta-ai/letta-code-sdk`. Il spawn le CLI `@letta-ai/letta-code` comme subprocess et communique via stdin/stdout JSON.

### Fonctions principales

```typescript
import {
  prompt,           // one-shot : envoie un prompt, retourne le résultat
  createSession,    // crée une nouvelle conversation (nouvel agent ou agent existant)
  resumeSession,    // reprend une conversation existante
  createAgent,      // crée un nouvel agent avec config custom
} from '@letta-ai/letta-code-sdk';
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

### Types de messages dans le stream

```typescript
// Messages streamés via session.stream()
interface SDKAssistantMessage {
  type: 'assistant';
  content: string;    // texte de la réponse (peut arriver en chunks)
  uuid: string;
}

interface SDKResultMessage {
  type: 'result';
  success: boolean;
  result?: string;
  error?: string;
  durationMs: number;
  conversationId: string;
}

// Note : le SDK actuel ne remonte que 'assistant' et 'result'.
// Les tool_call_message / tool_return_message ne sont PAS exposés
// par le SDK (ils le sont via le Letta TS Client directement).
// C'est une limitation pour Phase 2 — on s'en occupe plus tard.
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

## Types Letta Server (pour référence future — Phase 2+)

Le Letta Server renvoie ces types de messages lors du streaming :

```
reasoning_message     → réflexion interne de l'agent
assistant_message     → réponse textuelle visible
tool_call_message     → l'agent appelle un outil (Bash, Read, etc.)
tool_return_message   → résultat de l'exécution de l'outil
usage_statistics      → tokens utilisés
```

Séquence typique avec outils :
```
reasoning_message → tool_call_message → tool_return_message → reasoning_message → assistant_message
```

Ces types ne sont pas directement accessibles via le SDK actuel. Pour y accéder, il faudra utiliser `@letta-ai/letta-client` directement (Phase 2).

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
