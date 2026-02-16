# CLAUDE.md — OpenLetta

## Projet

OpenLetta est une TUI (Terminal User Interface) qui utilise le **Letta Code SDK** comme moteur d'agent IA. L'idée : prendre le "cerveau" de Letta Code (agent stateful à mémoire persistante, exécution locale d'outils, skills, subagents) et y greffer une interface terminal riche inspirée d'**OpenCode** (github.com/anomalyco/opencode).

Le Letta Code SDK fait **tout** le travail lourd. OpenLetta est **uniquement une couche UI**.

## Règles du projet

### Stack

- **Langage** : TypeScript (strict mode)
- **Runtime** : Bun (pas Node)
- **TUI** : Ink 5+ (React pour terminal)
- **Agent** : `@letta-ai/letta-code-sdk` (spawn le CLI Letta Code en subprocess)
- **Build** : tsup pour le bundle de distribution
- **Pas de framework CSS** — on est dans un terminal

### Conventions

- Tout le code source dans `src/`
- Composants Ink dans `src/components/`
- Hooks React custom dans `src/hooks/`
- Utilitaires dans `src/utils/`
- Point d'entrée CLI dans `bin/openletta.ts`
- Point d'entrée app dans `src/index.tsx`
- Composant racine dans `src/App.tsx`
- Tests dans `__tests__/` à la racine (Bun test runner)
- Noms de fichiers : PascalCase pour les composants, camelCase pour le reste
- Exports nommés (pas de default exports sauf pour les composants Ink principaux)
- Pas de `any` — utiliser `unknown` + type guards si nécessaire
- Pas de classes — fonctions et hooks uniquement
- Commentaires en anglais, documentation utilisateur en français

### Architecture

```
┌──────────────────────────────────────────┐
│            OpenLetta TUI (Ink)           │
│                                          │
│  InputBar → App → ChatView              │
│                 → StreamRenderer         │
│                 → StatusBar              │
│                 → ToolCallCard (phase 2) │
│                                          │
├──────────────────────────────────────────┤
│         hooks/useLettaSession.ts         │
│         hooks/useStream.ts               │
│              ↕                            │
│      @letta-ai/letta-code-sdk            │
│   (spawn Letta Code CLI subprocess)      │
│              ↕                            │
│   Tool Executor local (Bash, Read, etc.) │
│              ↕                            │
│     Letta Server (Cloud ou Docker)       │
│   Agent state, mémoire, conversations   │
└──────────────────────────────────────────┘
```

### Workflow de développement

1. Toujours lancer `bun run dev` pour tester les changements
2. Le user doit avoir Letta Code installé et authentifié (`npm i -g @letta-ai/letta-code && letta` pour auth initiale)
3. Les variables d'env ne sont PAS nécessaires — le SDK utilise l'auth de Letta Code

## Développement itératif

Ce projet se construit **brique par brique**. Consulte `docs/PLAN.md` pour la progression des phases. On commence par la Phase 1 (chat basique + streaming). Ne jamais sauter de phase ni implémenter des features d'une phase ultérieure sans qu'on te le demande.

**Quand tu proposes une version à tester :**
1. Assure-toi que ça compile (`bun run build`)
2. Assure-toi que ça se lance (`bun run dev`)
3. Liste les changements et ce qu'on peut tester
4. Attends le feedback avant de continuer

## Commandes

```bash
bun install         # installer les dépendances
bun run dev         # lancer la TUI en mode dev
bun run build       # build avec tsup
bun run lint        # vérifier le code
bun run test        # lancer les tests
```
