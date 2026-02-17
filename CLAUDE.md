# CLAUDE.md — OpenLetta

## Projet

OpenLetta est une TUI (Terminal User Interface) qui utilise **Letta Code** comme moteur d'agent IA. L'idée : prendre le "cerveau" de Letta Code (agent stateful à mémoire persistante, exécution locale d'outils, skills, subagents) et y greffer une interface terminal riche inspirée d'**OpenCode** (github.com/anomalyco/opencode).

Letta Code fait **tout** le travail lourd. OpenLetta est **uniquement une couche UI**.

### Phase Actuelle
- **Phase 1** ✅ Complète (2026-02-16) : Chat basique + streaming des réponses
- **Phase 2** ✅ Complète (2026-02-17) : Rendu riche des tool calls (Bash, Read, Edit, Write)
- **Phase 3** 🔜 Prochaine : Modes Plan/Build avec restrictions d'outils

## Règles du projet

### Stack

- **Langage** : TypeScript (strict mode)
- **Runtime** : Bun (pas Node)
- **TUI** : Ink 5+ (React pour terminal)
- **Agent** : `@letta-ai/letta-code` (client API pour accès complet aux types de messages)
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
│         types/letta.ts (Phase 2)         │
│              ↕                            │
│      @letta-ai/letta-code (client API)   │
│   Streaming: 6 message types             │
│   (user, reasoning, assistant, tool_*,  │
│    usage_statistics)                    │
│              ↕                            │
│   Tool Executor server-side              │
│   (Bash, Read, Edit, Write, etc.)       │
│              ↕                            │
│     Letta Server (Cloud ou Docker)       │
│   Agent state, mémoire, conversations   │
└──────────────────────────────────────────┘
```

### Workflow de développement

1. Toujours lancer `bun run dev` pour tester les changements
2. Le user doit avoir Letta Code installé et authentifié:
   ```bash
   npm i -g @letta-ai/letta-code
   letta  # initialiser l'auth locale
   ```
3. Les variables d'env ne sont PAS nécessaires — le client utilise l'auth stockée localement
4. Pour Phase 2 (rendu des tools) : consulter `docs/MESSAGE_TYPES.md` et `PHASE2_PREP.md`

## Développement itératif

Ce projet se construit **brique par brique**. Consulte `ROADMAP.md` pour la progression des phases.

### Phase 1 → Phase 2 Transition
- Phase 1 ✅ Complète et validée
- Phase 2 préparation ✅ Complète (voir `PHASE2_PREP.md` et `PHASE2_CHECKLIST.md`)
- Les types de messages et data flows sont en place
- Prête pour l'implémentation des renderers (BashOutput, FileRead, FileDiff, FileWrite)

**Quand tu proposes une version à tester :**
1. Assure-toi que ça compile (`bun run build`)
2. Assure-toi que ça se lance (`bun run dev`)
3. Liste les changements et ce qu'on peut tester
4. Attends le feedback avant de continuer

**Documentation à consulter:**
- `ROADMAP.md` — Progression par phase
- `SPEC.md` — Spécifications techniques et types
- `docs/MESSAGE_TYPES.md` — Types de messages Letta (Phase 2+)

## Commandes

```bash
bun install         # installer les dépendances
bun run dev         # lancer la TUI en mode dev
bun run build       # build avec tsup
bun run lint        # vérifier le code
bun run test        # lancer les tests
```
