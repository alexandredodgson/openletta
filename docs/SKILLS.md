# SKILLS.md — Référentiel de compétences et documentation

Ce fichier liste les compétences, bibliothèques et documentations essentielles pour le développement d'OpenLetta. Pour chaque tâche, l'agent doit se référer à cette liste et utiliser le MCP **Context7** pour récupérer la documentation à jour.

## Core UI (TUI avec Ink)
- **Ink** : Framework React pour le terminal.
  - ID Context7 : `/vadimdemedes/ink`
- **Ink UI** : Collection de composants UI (TextInput, Select, Spinner).
  - ID Context7 : `/vadimdemedes/ink-ui`
- **Ink Tab** : Gestion des onglets (utile pour Phase 3/4).
  - ID Context7 : `/websites/jdeniau_gitbook_io_ink-tab`
- **Chalk** : Stylisation des chaînes de caractères dans le terminal.
  - ID Context7 : `/chalk/chalk`

## Logique & Architecture
- **React** : Hooks, gestion d'état et cycle de vie des composants.
  - ID Context7 : `/websites/react_dev`
- **TypeScript** : Typage statique, interfaces et meilleures pratiques.
  - ID Context7 : `/microsoft/typescript`
- **Zod** : Validation de schémas et inférence de types.
  - ID Context7 : `/websites/zod_dev`

## Intégration AI
- **Letta Code SDK** : Interaction avec le serveur Letta et gestion des sessions d'agent.
  - ID Context7 : `/letta-ai/letta-code`
- **Letta API** : Référence complète de l'API Letta.
  - ID Context7 : `/websites/letta_api`

## Outils & Runtime
- **Bun** : Runtime, gestionnaire de paquets, bundler et exécuteur de tests.
  - ID Context7 : `/oven-sh/bun`
- **Marked Terminal** : Rendu Markdown riche dans le terminal.
  - ID Context7 : `/mikaelbr/marked-terminal`

## Tests & Qualité
- **Bun Test** : Framework de test intégré à Bun.
  - ID Context7 : `/oven-sh/bun` (section tests)
- **Ink Testing Library** : Utilitaires pour tester les composants Ink.
  - ID Context7 : `/vadimdemedes/ink-testing-library`

## Actions à entreprendre (Best Practices)
1. **Initialisation** : Toujours vérifier les types dans `src/types/letta.ts`.
2. **Développement** : Utiliser `bun run dev` pour un feedback immédiat.
3. **Tests** : Écrire des tests unitaires avec `bun test` pour les nouveaux hooks ou utilitaires.
4. **Build** : Vérifier que `bun run build` (tsup) fonctionne sans erreur avant toute soumission.
