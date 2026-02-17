# PHASE 4 — Multi-session & Sidebar

## Objectifs
- Ajouter une barre latérale (Sidebar) occupant 25% de la largeur à gauche.
- Permettre de basculer entre différents **Agents**.
- Permettre de gérer plusieurs **Conversations** (sessions) par agent.
- Navigation au clavier (Flèches + Raccourci de focus).

## Architecture Technique

### 1. Composants UI
- **Sidebar.tsx** :
  - Liste des agents.
  - Liste des conversations pour l'agent sélectionné.
  - Indicateur de focus visuel.
- **Layout** : Modification de `App.tsx` pour utiliser un `Box` horizontal contenant la Sidebar et la ChatArea.

### 2. Gestion d'état
- État `focusArea`: 'sidebar' | 'chat'.
- État `selectedAgentId` et `selectedConversationId`.
- Touche de basculement (ex: `Ctrl+S` ou `F1`).

### 3. Intégration Letta
- Extension de `useLettaSession` pour :
  - `listAgents()`: Récupérer la liste des agents via `client.agents.list()`.
  - `listConversations(agentId)`: Récupérer les groupes de messages (sessions) via `client.agents.messages.list()` avec filtrage par `groupId`.
  - `switchAgent(agentId)`: Recharger l'état de la session pour un nouvel agent.
  - `switchConversation(conversationId)`: Charger l'historique d'un groupe spécifique.

### 4. Persistance
- Utilisation de `conf` pour sauvegarder le dernier `agentId` et `conversationId` actif.

## Plan d'implémentation
1. **Refonte du Layout** : Introduire la Sidebar avec une largeur fixe de 25%.
2. **Data Layer** : Mettre à jour `useLettaSession` pour supporter les listes d'agents/conversations.
3. **Navigation** : Implémenter le changement de focus et la sélection par flèches.
4. **Chargement de l'historique** : S'assurer que le changement d'agent/conversation recharge correctement le `ChatView`.
