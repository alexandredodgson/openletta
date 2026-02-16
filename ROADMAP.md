# ROADMAP.md — OpenLetta

## Phase actuelle : 1 — Chat basique + Streaming

### Objectif

Pouvoir lancer `bun run dev`, envoyer un prompt à un agent Letta, voir la réponse streamée token par token, et tenir une conversation multi-turn.

### Composants à créer

| Fichier | Rôle |
|---|---|
| `src/index.tsx` | Entry point, lance Ink `render(<App />)` |
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

- [v] `bun run dev` lance la TUI sans erreur
- [v] Premier prompt → réponse streamée visible dans le terminal
- [v] Conversation multi-turn fonctionne (2+ échanges)
- [v] Messages user et assistant visuellement distincts (couleur ou préfixe)
- [v] L'état (thinking/streaming/idle) est affiché dans la status bar
- [v] Ctrl+C quitte proprement sans orphan process
- [v] L'agentId est persisté localement pour resume au prochain lancement
- [v] Le scroll fonctionne quand l'historique dépasse la hauteur du terminal

### Ce qui n'est PAS dans cette phase

- Rendu des tool calls
- Modes plan/build
- Multi-session
- Sidebar
- Fuzzy search fichiers
- Slash commands
- Configuration

---

## Phase 2 — Rendu des tool calls

**Statut** : pas commencé
**Prérequis** : Phase 1 terminée + migration vers `@letta-ai/letta-client` pour avoir les tool_call_message

---

## Phase 3 — Modes Plan / Build

**Statut** : pas commencé
**Prérequis** : Phase 2 terminée

---

## Phase 4 — Multi-session & sidebar

**Statut** : pas commencé

---

## Phase 5 — Référencement fichiers (@)

**Statut** : pas commencé

---

## Phase 6 — Slash commands

**Statut** : pas commencé

---

## Phase 7 — Share links & polish

**Statut** : pas commencé

---

## Phase 8 — Distribution

**Statut** : pas commencé
