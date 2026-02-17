# ROADMAP.md — OpenLetta

## Vision et progression

Ce roadmap détaille la construction progressive d'OpenLetta, de la TUI basique jusqu'à l'application desktop complète. Chaque phase s'appuie sur la précédente et rapproche le projet de l'objectif global.

---

## Phase 1 — Chat basique + Streaming

**Statut** : ✅ Terminé (2025-02-16)

### Objectif

Établir la fondation : pouvoir lancer OpenLetta, envoyer un prompt à un agent Letta, voir la réponse streamée token par token, et tenir une conversation multi-turn. Cette phase valide l'intégration du SDK et la structure de base de la TUI.

### Composants créés

| Fichier | Rôle |
|---|---|
| `src/cli.tsx` | Entry point, lance Ink `render(<App />)` |
| `src/App.tsx` | État global, orchestre session Letta, distribue aux composants |
| `src/components/ChatView.tsx` | Affiche l'historique des messages (scrollable) |
| `src/components/InputBar.tsx` | Champ de saisie utilisateur en bas du terminal |
| `src/components/StreamRenderer.tsx` | Affiche le texte en cours de streaming |
| `src/components/StatusBar.tsx` | Barre d'état : agent ID, mode, état (idle/thinking/streaming) |
| `src/hooks/useLettaSession.ts` | Hook : crée/reprend une session, expose send/stream/close |
| `src/hooks/useStream.ts` | Hook : consomme l'async iterator du stream et met à jour le state |
| `src/utils/format.ts` | Formatage minimal du markdown pour le terminal |

### Comportement attendu

1. L'app démarre, crée une session Letta (ou reprend la dernière)
2. L'utilisateur tape un message dans l'InputBar, appuie sur Enter
3. Le message apparaît dans le ChatView (côté user)
4. Le stream Letta démarre → le texte apparaît progressivement dans StreamRenderer
5. Quand le stream finit (msg.type === 'result'), le message complet est ajouté au ChatView
6. L'utilisateur peut envoyer un nouveau message (multi-turn)
7. Ctrl+C quitte proprement (session.close())
8. Au prochain lancement, l'agent se souvient de la conversation précédente

### Critères d'acceptation

- [x] `bun run dev` lance la TUI sans erreur
- [x] Premier prompt → réponse streamée visible dans le terminal
- [x] Conversation multi-turn fonctionne (2+ échanges)
- [x] Messages user et assistant visuellement distincts (couleur ou préfixe)
- [x] L'état (thinking/streaming/idle) est affiché dans la status bar
- [x] Ctrl+C quitte proprement sans orphan process
- [x] L'agentId est persisté localement pour resume au prochain lancement
- [x] Le scroll fonctionne quand l'historique dépasse la hauteur du terminal

### Accomplissements

- ✅ Architecture de base fonctionnelle (App + hooks + composants)
- ✅ Intégration réussie du `@letta-ai/letta-code-sdk`
- ✅ Streaming token par token opérationnel
- ✅ Persistence de l'agent entre sessions
- ✅ Interface terminal responsive avec Ink
- ✅ Gestion propre du cycle de vie (cleanup, Ctrl+C)

### Ce qui n'est PAS dans cette phase

- Rendu des tool calls (Bash, Read, Edit, Write)
- Modes plan/build
- Multi-session / sidebar
- Fuzzy search fichiers
- Slash commands
- Configuration avancée

### Avant de passer à la Phase 2

**Documentation**
- [x] Checklist de la Phase 1 complétée et validée
- [x] ROADMAP.md mis à jour (statut, accomplissements, date)
- [x] CLAUDE.md vérifié et à jour
- [x] README.md vérifié (objectif global ajouté)
- [x] SPEC.md vérifié

**Validation technique**
- [x] Tous les tests de la Phase 1 passent
- [x] Build sans erreurs (`bun run build`)
- [x] Lancement sans crash (`bun run dev`)

**Objectif global**
- [x] ✅ Cette phase établit la base de la TUI et valide l'intégration SDK
- [x] ✅ Rapprochement : fondation solide pour les phases suivantes
- [x] ⚠️ Écart identifié : nécessite migration vers `@letta-ai/letta-client` pour Phase 2

**Pré-requis Phase 2** ✅ EN COURS
- [x] Phase 1 terminée et validée
- [x] Migration vers `@letta-ai/letta-code` pour accéder aux types complets
- [x] Étude des types de messages Letta Server (reasoning, tool_call, tool_return)
- [x] Design des composants de rendu d'outils (ToolCallCard, BashOutput, FileDiff)
- [x] Types centralisés dans `src/types/letta.ts`
- [x] useStream étendu pour capturer tous les types
- [x] ChatView avec placeholders pour Phase 2
- [x] Documentation des types de messages (MESSAGE_TYPES.md)

---

## Phase 2 — Rendu des tool calls

**Statut** : 🔜 Pas commencé

### Objectif

Rendre visible les actions de l'agent : quand il exécute du bash, lit un fichier, ou édite du code, l'utilisateur doit voir ces opérations avec un rendu riche (diffs colorés, sortie ANSI préservée, indicateurs de succès/échec).

Cette phase transforme OpenLetta d'un simple chat en un véritable observateur des opérations de l'agent.

### Fonctionnalités cibles

- **Affichage des tool calls** : chaque appel d'outil apparaît comme une carte dans le chat
- **Rendu Bash** : sortie stdout/stderr avec couleurs ANSI préservées
- **Rendu Read** : affichage du contenu de fichier lu avec syntax highlighting
- **Rendu Edit** : diff coloré (lignes supprimées en rouge, ajoutées en vert)
- **Rendu Write** : confirmation de création/écrasement de fichier
- **États d'exécution** : pending → running → success/error
- **Liens cliquables** : vers les fichiers modifiés (si terminal le supporte)

### Composants à créer

- `src/components/ToolCallCard.tsx` — Container générique pour un tool call
- `src/components/tools/BashOutput.tsx` — Rendu spécifique pour Bash
- `src/components/tools/FileRead.tsx` — Rendu pour Read
- `src/components/tools/FileDiff.tsx` — Rendu pour Edit avec diff
- `src/components/tools/FileWrite.tsx` — Rendu pour Write
- `src/utils/diff.ts` — Génération de diffs colorés
- `src/utils/syntax.ts` — Syntax highlighting (via cli-highlight)

### Critères d'acceptation

- [ ] Les tool calls apparaissent visuellement dans le chat
- [ ] Bash output préserve les couleurs ANSI
- [ ] Edit montre un diff clair (avant/après)
- [ ] Read affiche le contenu avec syntax highlighting
- [ ] Write confirme l'opération avec chemin du fichier
- [ ] Les erreurs d'exécution sont visibles et explicites
- [ ] Le flux de conversation reste lisible malgré les tool calls

### Pré-requis techniques

- Migration de `@letta-ai/letta-code-sdk` vers `@letta-ai/letta-client`
- Accès aux types `tool_call_message` et `tool_return_message`
- Compréhension du flux : reasoning → tool_call → tool_return → reasoning → assistant

### Avant de passer à la Phase 3

**Documentation**
- [ ] Checklist de la Phase 2 complétée et validée
- [ ] ROADMAP.md mis à jour (statut, accomplissements, date)
- [ ] CLAUDE.md mis à jour si workflow modifié
- [ ] README.md mis à jour (features visibles)
- [ ] SPEC.md mis à jour (types de messages)

**Validation technique**
- [ ] Tous les tests de la Phase 2 passent
- [ ] Build sans erreurs
- [ ] Rendu des outils testé avec tous les types (Bash, Read, Edit, Write)

**Objectif global**
- [ ] Évaluer : cette phase rend l'agent "observable", rapproche de l'UX OpenCode
- [ ] Identifier : quels ajustements pour la Phase 3 (modes plan/build)

**Pré-requis Phase 3**
- [ ] Phase 2 terminée et validée
- [ ] Comprendre le système de permissions de Letta (allowedTools)
- [ ] Design du switch de mode plan ↔ build
- [ ] Étude de l'implémentation des modes dans OpenCode

---

## Phase 3 — Modes Plan / Build

**Statut** : 🔜 Pas commencé

### Objectif

Introduire deux modes de travail distincts :
- **Mode Plan** : l'agent peut lire, analyser, proposer, mais pas modifier (lecture seule)
- **Mode Build** : l'agent peut exécuter, éditer, créer (tous les outils autorisés)

Cette phase donne à l'utilisateur le contrôle sur le niveau d'action de l'agent, comme dans OpenCode.

### Fonctionnalités cibles

- **Indicateur de mode** dans la status bar (PLAN ou BUILD)
- **Raccourci Tab** pour switch plan ↔ build
- **Restriction d'outils** en mode Plan :
  - ✅ Autorisé : Read, Glob, Think
  - ❌ Bloqué : Edit, Write, Bash (sauf en --dry-run)
- **Tous les outils** en mode Build
- **Confirmation visuelle** quand l'agent tente une action bloquée en mode Plan
- **Persistence du mode** entre sessions (optionnel)

### Critères d'acceptation

- [ ] Tab switch entre Plan et Build
- [ ] Status bar affiche le mode courant
- [ ] En mode Plan, les outils d'édition sont bloqués
- [ ] En mode Build, tous les outils fonctionnent
- [ ] Message clair si l'agent tente une action interdite
- [ ] Le mode peut être forcé au lancement (`--mode plan`)

### Pré-requis techniques

- Comprendre le paramètre `allowedTools` dans `createSession`
- Implémenter un système de garde pour bloquer les tool calls interdits
- Gérer la communication du mode à l'agent (via system prompt ou options)

### Avant de passer à la Phase 4

**Documentation**
- [ ] Checklist de la Phase 3 complétée et validée
- [ ] ROADMAP.md mis à jour
- [ ] CLAUDE.md mis à jour
- [ ] README.md mis à jour (features modes)
- [ ] Docs utilisateur sur l'usage des modes

**Validation technique**
- [ ] Tests des restrictions d'outils en mode Plan
- [ ] Tests des permissions complètes en mode Build
- [ ] Switch de mode fluide sans crash

**Objectif global**
- [ ] Évaluer : modes plan/build rapprochent du contrôle fin d'OpenCode
- [ ] Identifier : besoin de multi-session pour gérer plusieurs contextes

**Pré-requis Phase 4**
- [ ] Phase 3 terminée et validée
- [ ] Design de la sidebar et navigation multi-session
- [ ] Étude de la gestion des conversations dans Letta (conversationId)
- [ ] Composants de navigation (liste, création, suppression)

---

## Phase 4 — Multi-session & sidebar

**Statut** : 🔜 Pas commencé

### Objectif

Permettre à l'utilisateur de gérer plusieurs conversations simultanément, chacune avec son propre historique, tout en partageant la mémoire de l'agent (comme dans OpenCode). Introduction d'une sidebar pour naviguer entre les sessions.

### Fonctionnalités cibles

- **Sidebar gauche** : liste des conversations actives
- **Création** de nouvelle conversation (`/new` ou raccourci)
- **Switch** entre conversations (flèches haut/bas + Enter)
- **Suppression** de conversations
- **Indicateur visuel** de la conversation active
- **Mémoire partagée** : toutes les conversations utilisent le même agent
- **Historique isolé** : chaque conversation a ses propres messages

### Composants à créer

- `src/components/Sidebar.tsx` — Liste navigable des conversations
- `src/components/ConversationItem.tsx` — Item de conversation dans la sidebar
- `src/hooks/useConversations.ts` — Gestion de plusieurs sessions
- `src/utils/conversations.ts` — Persistence locale des IDs de conversation

### Critères d'acceptation

- [ ] Sidebar affiche la liste des conversations
- [ ] Création d'une nouvelle conversation
- [ ] Switch entre conversations sans perte d'état
- [ ] Suppression de conversation
- [ ] La mémoire agent persiste entre conversations
- [ ] Layout adapté : sidebar + chat + input

### Avant de passer à la Phase 5

**Documentation**
- [ ] Checklist de la Phase 4 complétée
- [ ] ROADMAP.md, CLAUDE.md, README.md mis à jour
- [ ] Docs utilisateur sur la gestion des sessions

**Validation technique**
- [ ] Tests de création/suppression de sessions
- [ ] Tests de persistence de la mémoire agent
- [ ] Navigation fluide entre sessions

**Objectif global**
- [ ] Évaluer : multi-session rapproche du workflow OpenCode
- [ ] Identifier : besoin de référencement fichiers pour contexte enrichi

**Pré-requis Phase 5**
- [ ] Phase 4 terminée et validée
- [ ] Système de fuzzy search pour fichiers
- [ ] Intégration de la syntaxe @ dans l'input
- [ ] Composant de sélection de fichiers

---

## Phase 5 — Référencement fichiers (@)

**Statut** : 🔜 Pas commencé

### Objectif

Permettre à l'utilisateur d'injecter le contenu de fichiers directement dans le prompt via la syntaxe `@filename`, comme dans OpenCode. Cela enrichit le contexte de l'agent sans avoir à copier-coller manuellement.

### Fonctionnalités cibles

- **Syntaxe @** dans l'input : `@src/App.tsx fix the bug`
- **Fuzzy search** : liste de suggestions après avoir tapé `@`
- **Injection de contenu** : le contenu du fichier est ajouté au prompt
- **Multi-fichiers** : `@file1.ts @file2.ts analyze the differences`
- **Prévisualisation** : hover sur @file montre un extrait
- **Glob support** : `@src/**/*.ts` pour référencer plusieurs fichiers

### Composants à créer

- `src/components/FileSelector.tsx` — Dropdown de fuzzy search
- `src/hooks/useFileSearch.ts` — Fuzzy search dans le cwd
- `src/utils/files.ts` — Lecture et injection de contenu

### Critères d'acceptation

- [ ] `@` déclenche le fuzzy search
- [ ] Sélection de fichier injecte son contenu
- [ ] Support de plusieurs fichiers dans un prompt
- [ ] Glob patterns fonctionnent (`@src/**/*.ts`)
- [ ] Interface fluide (pas de lag sur gros projets)

### Avant de passer à la Phase 6

**Documentation**
- [ ] Checklist de la Phase 5 complétée
- [ ] ROADMAP.md, CLAUDE.md, README.md mis à jour
- [ ] Docs utilisateur sur la syntaxe @

**Validation technique**
- [ ] Tests de fuzzy search
- [ ] Tests d'injection de contenu
- [ ] Performance sur gros projets (>1000 fichiers)

**Objectif global**
- [ ] Évaluer : référencement fichiers enrichit le contexte agent
- [ ] Identifier : besoin de slash commands pour configuration avancée

**Pré-requis Phase 6**
- [ ] Phase 5 terminée et validée
- [ ] Design du système de slash commands
- [ ] Étude des APIs Letta pour config (memory, model, agents)
- [ ] Composants de configuration

---

## Phase 6 — Slash commands

**Statut** : 🔜 Pas commencé

### Objectif

Introduire des commandes spéciales (préfixées par `/`) pour contrôler l'agent, configurer les paramètres, et gérer la mémoire, comme dans OpenCode et Letta Code CLI.

### Fonctionnalités cibles

- `/init [preset]` — Initialiser avec un preset de system prompt
- `/remember [text]` — Ajouter une info à la mémoire persistante
- `/model [name]` — Changer le modèle LLM
- `/memory` — Afficher la mémoire actuelle
- `/agent [id]` — Switch vers un autre agent
- `/config` — Afficher la config actuelle
- `/clear` — Vider l'affichage (pas la mémoire)
- `/new` — Créer une nouvelle conversation
- `/help` — Liste des commandes

### Composants à créer

- `src/commands/index.ts` — Dispatcher de commandes
- `src/commands/init.ts`, `remember.ts`, etc. — Implémentations
- `src/components/CommandOutput.tsx` — Rendu des résultats de commande

### Critères d'acceptation

- [ ] `/` déclenche l'autocomplétion des commandes
- [ ] Chaque commande fonctionne comme spécifié
- [ ] Feedback clair en cas d'erreur (commande inconnue, paramètre manquant)
- [ ] `/help` liste toutes les commandes disponibles
- [ ] Les commandes modifient l'agent sans casser la session

### Avant de passer à la Phase 7

**Documentation**
- [ ] Checklist de la Phase 6 complétée
- [ ] ROADMAP.md, CLAUDE.md, README.md mis à jour
- [ ] Docs utilisateur complètes sur les slash commands

**Validation technique**
- [ ] Tests de chaque commande
- [ ] Tests de cas d'erreur (paramètres invalides)
- [ ] Intégration fluide dans le workflow

**Objectif global**
- [ ] Évaluer : slash commands donnent contrôle fin sur l'agent (comme OpenCode)
- [ ] Identifier : besoin de share links et polish pour adoption utilisateur

**Pré-requis Phase 7**
- [ ] Phase 6 terminée et validée
- [ ] Système de génération de liens partageables
- [ ] Design des thèmes et keybindings
- [ ] Système de permissions (approve/deny tool calls)

---

## Phase 7 — Share links & polish

**Statut** : 🔜 Pas commencé

### Objectif

Polir l'expérience utilisateur : partage de conversations, thèmes visuels, keybindings personnalisables, et système de permissions pour approuver/refuser les tool calls avant exécution.

### Fonctionnalités cibles

- **Share links** : générer un lien public pour une conversation
- **Thèmes** : light, dark, custom colors
- **Keybindings** : personnalisation des raccourcis clavier
- **Permissions** : mode `--prompt` pour approuver chaque tool call
- **Export** : sauvegarder une conversation en Markdown
- **Import** : charger une conversation depuis un fichier

### Critères d'acceptation

- [ ] `/share` génère un lien public
- [ ] Thème sélectionnable (`/theme dark`)
- [ ] Keybindings configurables (fichier de config)
- [ ] Mode permission : confirm avant chaque tool call
- [ ] Export/import de conversations fonctionnent

### Avant de passer à la Phase 8

**Documentation**
- [ ] Checklist de la Phase 7 complétée
- [ ] ROADMAP.md, CLAUDE.md, README.md mis à jour
- [ ] Docs utilisateur finalisées (guide complet)

**Validation technique**
- [ ] Tests de génération de share links
- [ ] Tests des thèmes sur différents terminaux
- [ ] Tests du système de permissions

**Objectif global**
- [ ] Évaluer : polish rapproche de la qualité OpenCode
- [ ] Identifier : besoin de distribution large (npm, desktop)

**Pré-requis Phase 8**
- [ ] Phase 7 terminée et validée
- [ ] Packaging npm prêt
- [ ] Design de l'app desktop (Tauri)
- [ ] Extension VSCode (optionnel)

---

## Phase 8 — Distribution

**Statut** : 🔜 Pas commencé

### Objectif

Rendre OpenLetta accessible au plus grand nombre : package npm global, application desktop (Tauri), et potentiellement extension VSCode.

### Livrables cibles

- **npm package** : `npm i -g openletta` → `openletta` dans le terminal
- **App desktop** : application autonome avec interface visuelle (Windows, macOS, Linux)
- **Extension VSCode** (optionnel) : intégration dans l'éditeur
- **Docs publiques** : site web avec guides et exemples
- **CI/CD** : releases automatiques

### Composants à créer

- Package npm avec bin correctement configuré
- Application Tauri (Rust + webview)
- CI/CD pipelines (GitHub Actions)
- Site de documentation (Docusaurus ou similaire)

### Critères d'acceptation

- [ ] `npm i -g openletta && openletta` fonctionne
- [ ] App desktop installable et fonctionnelle
- [ ] Releases automatiques sur GitHub
- [ ] Documentation publique accessible
- [ ] Tests d'installation sur Windows, macOS, Linux

### Accomplissements finaux

À compléter une fois la Phase 8 terminée.

### Objectif global atteint

- [ ] TUI riche et fonctionnelle ✅
- [ ] Rendu des outils comme OpenCode ✅
- [ ] Modes plan/build opérationnels ✅
- [ ] Multi-session fluide ✅
- [ ] Référencement fichiers @ ✅
- [ ] Slash commands complets ✅
- [ ] Polish et permissions ✅
- [ ] **Application desktop moderne** ✅
- [ ] Distribution large (npm, desktop) ✅

---

## Pré-requis techniques généraux

Ces pré-requis s'appliquent à toutes les phases :

- **Runtime** : Bun >= 1.0
- **Letta Code** : `npm i -g @letta-ai/letta-code && letta` (auth initiale)
- **TypeScript** : strict mode activé
- **Tests** : Bun test runner
- **Build** : tsup pour le bundle

## Méthodologie de développement

1. **Ne jamais sauter de phase** : chaque phase s'appuie sur la précédente
2. **Valider avant de continuer** : compléter la checklist de phase
3. **Documenter en continu** : ROADMAP.md, CLAUDE.md, README.md à jour
4. **Tester régulièrement** : `bun run build && bun run dev`
5. **Confronter à l'objectif global** : chaque phase doit rapprocher du but final
