# CLAUDE.md — OpenLetta

## Projet

OpenLetta est une TUI (Terminal User Interface) qui utilise le **Letta Code SDK** comme moteur d'agent IA. L'idée : prendre le "cerveau" de Letta Code (agent stateful à mémoire persistante, exécution locale d'outils, skills, subagents) et y greffer une interface terminal riche inspirée d'**OpenCode** (github.com/anomalyco/opencode).

Le Letta Code SDK fait **tout** le travail lourd. OpenLetta est **uniquement une couche UI**.

## Objectif global du projet

Créer une interface complète pour agents Letta Code qui combine :
- **La puissance de Letta Code** : mémoire persistante, exécution d'outils locaux, skills, subagents
- **L'UX d'OpenCode** : rendu riche des outils, modes plan/build, multi-session, navigation fluide
- **Une application desktop moderne** : interface visuelle élégante et accessible (comme OpenCode)
- **Multi-plateforme** : déployable en CLI, TUI terminal, et app desktop selon les besoins

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
- Point d'entrée CLI dans `src/cli.tsx`
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
│                 → Sidebar (phase 4)      │
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

## Développement itératif par phases

Ce projet se construit **brique par brique** selon le ROADMAP.md. Chaque phase a des objectifs clairs et des critères de validation.

### Règles de progression entre phases

1. **Ne jamais sauter de phase** : respecter l'ordre du ROADMAP.md
2. **Valider complètement avant de continuer** : suivre la checklist de fin de phase
3. **Ne jamais implémenter de features d'une phase ultérieure** sans demande explicite
4. **Documenter en continu** : mettre à jour les fichiers après chaque modification significative

### Checklist de fin de phase (à suivre systématiquement)

Après avoir terminé tous les critères d'acceptation d'une phase :

#### 1. Documentation

- [ ] Compléter la checklist des critères d'acceptation de la phase
- [ ] Mettre à jour le statut dans ROADMAP.md (✅ Terminé + date)
- [ ] Rédiger la section "Accomplissements" dans ROADMAP.md
- [ ] Vérifier et mettre à jour CLAUDE.md si workflow modifié
- [ ] Vérifier et mettre à jour README.md si fonctionnalités visibles ajoutées
- [ ] Vérifier et mettre à jour SPEC.md si API ou types modifiés
- [ ] Mettre à jour toute autre documentation pertinente

#### 2. Validation technique

- [ ] Lancer `bun run build` → doit réussir sans erreurs
- [ ] Lancer `bun run dev` → doit démarrer sans crash
- [ ] Lancer `bun run test` → tous les tests passent
- [ ] Tester manuellement tous les critères d'acceptation de la phase
- [ ] Tester les cas d'erreur et edge cases identifiés

#### 3. Confrontation à l'objectif global

- [ ] **Évaluer** : En quoi cette phase rapproche-t-elle du but final ?
  - Quelles fonctionnalités de l'objectif global sont maintenant réalisées ?
  - Quels composants manquent encore ?
- [ ] **Identifier les écarts** : 
  - Y a-t-il des décisions techniques qui compliquent les phases futures ?
  - Y a-t-il des refactorings nécessaires avant de continuer ?
- [ ] **Documenter les ajustements** :
  - Si des changements de plan sont nécessaires, les noter dans ROADMAP.md
  - Si des dettes techniques sont identifiées, les documenter

#### 4. Pré-requis pour la phase suivante

- [ ] Lire la section "Pré-requis Phase N+1" dans ROADMAP.md
- [ ] Vérifier que tous les pré-requis techniques sont en place
- [ ] Identifier les recherches ou études nécessaires
- [ ] Si des pré-requis manquent, les compléter AVANT de démarrer la phase suivante

#### 5. Demander validation utilisateur

- [ ] Présenter les changements effectués
- [ ] Lister ce qui a été testé et validé
- [ ] Proposer une démo ou des exemples d'utilisation
- [ ] **Attendre le feedback avant de passer à la phase suivante**

### Quand proposer une version à tester

1. Assure-toi que ça compile (`bun run build`)
2. Assure-toi que ça se lance (`bun run dev`)
3. Liste les changements et ce qu'on peut tester
4. Mentionne les limitations ou bugs connus
5. **Attends le feedback avant de continuer**

## Commandes

```bash
bun install         # installer les dépendances
bun run dev         # lancer la TUI en mode dev
bun run build       # build avec tsup
bun run lint        # vérifier le code
bun run test        # lancer les tests
```

## Progression actuelle

**Phase en cours** : Phase 1 — Chat basique + Streaming (✅ Terminé)

Consulte ROADMAP.md pour les détails de chaque phase et la progression globale.

## Communication avec Claude (assistant IA)

- **Ton** : professionnel mais décontracté, partenaire de travail
- **Langue** : français par défaut, anglais pour le code et commentaires
- **Approche** : itérative et progressive, poser des questions de clarification
- **Ne jamais supposer** : en cas de doute, demander des précisions
- **Validation** : toujours présenter les changements avant d'avancer

## Structure des fichiers de documentation

- **README.md** : vue d'ensemble, installation, objectif global
- **ROADMAP.md** : phases de développement, critères, checklists
- **SPEC.md** : spécifications techniques du SDK Letta
- **CLAUDE.md** : ce fichier, règles du projet et workflow
