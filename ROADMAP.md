# OpenLetta Roadmap

## Phase 1 — Chat basique + Streaming
**Statut** : ✅ Terminé (2026-02-15)
**Accomplissements** :
- Initialisation du projet avec Bun, React (Ink) et tsup
- Intégration du SDK Letta Code basique
- Système de messages (User/Assistant) avec streaming en temps réel
- Interface TUI minimaliste avec InputBar et StatusBar

## Phase 2 — Tool Rendering & Rendu Riche
**Statut** : ✅ Terminé (2026-02-17)
**Accomplissements** :
- Migration vers @letta-ai/letta-code pour accéder à tous les types de messages
- Système de rendu spécialisé pour :
  - **Bash** : Sortie terminal avec preservation des couleurs ANSI
  - **File Read** : Affichage de contenu avec numéros de ligne
  - **File Edit** : Rendu des diffs unifiés (couleurs rouge/vert)
  - **File Write** : Confirmation d'écriture avec statistiques
- Composant ToolCallCard pour uniformiser l'affichage des outils
- Support complet du Reasoning (pensées de l'agent)

## Phase 3 — Modes Plan / Build
**Statut** : ✅ Terminé (2026-02-17)
**Accomplissements** :
- **Double mode de travail** : Plan (lecture seule) et Build (accès complet)
- **Restriction d'outils "officielle"** via l'API Letta (updateApproval et system prompt)
- **Garde-fou client-side** pour bloquer les outils d'édition en mode Plan
- **Exception intelligente** : Bash autorisé en mode Plan si --dry-run est utilisé
- **Animation visuelle** : Flash dans la StatusBar lors du changement de mode (Tab)
- **Persistance du mode** entre les sessions via conf

## Phase 4 — Multi-session & sidebar
**Statut** : ✅ Terminé (2026-02-17)
**Accomplissements** :
- Sidebar navigable (25% de largeur) avec focus via Ctrl+S
- Gestion multi-agents avec switch dynamique
- Gestion multi-sessions (conversations) via les groupes Letta
- Persistance de l'agent et de la conversation active via conf
- Chargement automatique de l'historique lors du basculement

---

## Phase 5 — Référencement fichiers (@)
**Statut** : ✅ Terminé (2026-02-17)
**Accomplissements** :
- Détection des motifs @filename dans l'entrée utilisateur.
- Injection automatique du contenu des fichiers dans le prompt.
- Gestion des erreurs de lecture de fichiers.

## Phase 6 — Slash commands
**Statut** : ✅ Terminé (2026-02-17)
**Accomplissements** :
- Interpréteur de commandes slash intégré.
- Support de /agent, /session, /memory, /config.
- Navigation facilitée via commandes textuelles.

## Phase 7 — Share links & polish
**Statut** : ✅ Terminé (2026-02-17)
**Accomplissements** :
- Commande /export pour sauvegarder l'historique en JSON.
- Commande /help avec liste des raccourcis et commandes.
- Nouvel état 'processing' dans la StatusBar pour les opérations locales.

## Phase 8 — Distribution
**Statut** : ✅ Terminé (2026-02-17)
**Accomplissements** :
- Ajout du shebang dans cli.tsx.
- Configuration du champ 'bin' dans package.json.
- Validation du build de distribution avec tsup.
