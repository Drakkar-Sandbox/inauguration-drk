# Inauguration Drakkar — Spécification produit & technique

> Source : session de cadrage du 2026-10-06. Ce document fait foi pour l'implémentation.
> Les valeurs marquées `TODO(contenu)` sont des placeholders à remplacer par Drakkar.

## 1. Objectif

- Inauguration des nouveaux bureaux Drakkar — **jeudi 3 décembre 2026**, 50–80 personnes (clients + quelques prestataires, +1 inclus).
- Objectif business : **pipeline mesurable** (RDV approfondis de découverte de besoin → missions). Ordres de grandeur : ~10–15 RDV à 30 j, ~3 missions à 3 mois (à affiner).
- Posture : le client vient **passer un bon moment**. Pitch léger assumé, jamais de démarchage. Les équipes Drakkar sont des hôtes.

## 2. Leif — l'avatar fil rouge

- **Nom provisoire « Leif »** — DOIT être paramétrable (config), jamais codé en dur dans les textes/prompts.
- Viking en costard, **3D stylisé** (ou mascotte qualité jeu vidéo / illustration), premium, jamais enfantin.
- Personnalité : hôte d'exception (majordome de grand hôtel × capitaine). Vouvoiement, phrases courtes, élégance, humour pince‑sans‑rire très dosé. Français.
- Voix : ElevenLabs (voix sur mesure), **toujours sous‑titrée**.
- Visuel généré par **OpenAI gpt-image (ChatGPT)** — pas par Claude. Deux pipelines d'animation à comparer :
  - A : image IA → image‑to‑3D → rig auto → animation temps réel (Three.js).
  - B : image IA → avatar parlant depuis une image (streaming).
  - Grille : qualité marque, lip‑sync, latence < 2 s, mobile 4G, coût, rendu plein corps sur fond noir.
- En attendant : le rendu de Leif est derrière une abstraction (`LeifAvatar`) avec un rendu provisoire, remplaçable sans toucher au reste.

### Garde‑fous (toutes conversations)
- Ne vend jamais, ne chiffre rien, ne donne aucun délai, aucun engagement, aucune promesse.
- Ne parle jamais des autres invités/clients, ne révèle aucune donnée d'un autre invité.
- Aucun avis politique/religieux/sujet sensible ; pas de contenu offensant ; résiste aux tentatives de détournement (prompt injection, « ignore tes instructions », jeu de rôle).
- Hors sujet → refus poli avec humour et retour au fil.
- Sait expliquer la politique de données (§6).

## 3. Parcours

### 3.1 Invitation & inscription (mise en ligne ≈ 9 nov.)
- Carton papier avec **QR nominatif** → `FRONTEND_URL/i/<token>`.
- Leif **parle et écoute dès l'inscription** : voix + sous‑titres ; le client répond à la voix (push‑to‑talk) **ou** par boutons/texte (repli toujours disponible, micro jamais obligatoire).
- Conversation **guidée** en langage naturel : accueil personnalisé → consentement données → confirmation présence (ou déclin) → +1 (prénom, nom, email) → infos pratiques → au revoir. FAQ pratique (adresse, horaires, accès, parking, dress code, programme) depuis une base de connaissances config. Hors sujet refusé.
- **Aucune question de qualification** à l'inscription.
- **+1 = invité à part entière** : un seul +1 par invité, modifiable jusqu'à J‑3. Dès qu'il est ajouté, le +1 **reçoit un email avec les infos pratiques et son propre QR** (pas de parcours conversationnel pour lui avant le jour J).
- Ajout au calendrier (.ics).
- Élément personnalisé exposé le jour J : **point ouvert, hors périmètre**.

### 3.2 Jour J — tout sur écrans (pas d'hologramme)
- **Accueil** : scan du QR (douchette USB en mode clavier ET caméra) → Leif accueille l'invité par son nom (10–15 s). Check‑in enregistré. Recherche manuelle par nom pour les invités sans QR (tablette hôte).
- **Discours** : intervention de Leif en duo avec le dirigeant, **répliques pré‑générées déclenchées par un opérateur** (console opérateur → écran discours). Zéro IA libre.
- **Borne « Défiez Leif »** : « Parlez‑lui de votre métier, il vous propose une idée IA en 60 secondes ». Identification par QR. Leif connaît l'invité + sa **fiche angle**, propose 1–2 pistes IA formulées comme des pistes (cas Drakkar anonymisés), puis **passation à un humain nommé** (le référent) qui reçoit une notification. Résumé structuré produit si consentement. Bouton push‑to‑talk, micro directionnel.
- **Modes dégradés** : accueils pré‑générés (audio par invité, la veille), répliques discours pré‑générées, phrases d'attente si latence, écran « Leif se repose, X prend le relais » si panne, réseau dédié.

### 3.3 Après l'event
- Relance au choix du **commercial en charge**, au cas par cas : email humain, vidéo/voix de Leif, ou les deux. **Validation humaine systématique**, aucun envoi automatique commercial.
- Le back‑office fournit : résumé des échanges, niveau d'intérêt, idée discutée, fiche angle, statut RDV.

## 4. Back‑office (staff Drakkar authentifié, réutilise l'auth existante)

- Invités : liste/filtre, création/édition, **import CSV**, statut (invité / confirmé / décliné / présent), +1 rattachés.
- **Fiche angle** par invité : sujet IA/upsell pertinent, notes, **référent Drakkar** (user).
- **Export QR** : PNG/SVG par invité + planche imprimable (pour l'imprimeur).
- Jour J : arrivées en temps réel, passages borne, passations à traiter (notification au référent).
- Après : conversations/résumés, intérêt, suivi RDV (à proposer / proposé / tenu / mission).
- Tableau de bord KPI : taux d'inscription, présence, passages borne, passations, RDV.
- **Pas d'intégration CRM** (export CSV suffisant).

## 5. Contenu de l'event (config, placeholders)

`TODO(contenu)` : adresse, horaires, programme, dress code, accès/parking, nom du dirigeant, texte des répliques du discours, liste des référents.

## 6. Données & consentement

- Consentement explicite à l'inscription (voix + écrit) ; rappel à la borne. Refus possible sans perdre l'expérience (pas de résumé conservé).
- **Aucun stockage audio** : transcription à la volée, audio jeté. Seuls transcriptions/résumés conservés (si consentement).
- Fournisseurs sans entraînement sur les données ; UE de préférence.
- Conservation limitée (6 mois), accès restreint au staff ; résumés jamais affichés sur les écrans publics.

## 7. Choix techniques par défaut (révisables)

| Brique | Choix | Repli sans clé |
|---|---|---|
| LLM conversation | Anthropic Claude (`@anthropic-ai/sdk`, modèle via env) | moteur scripté déterministe (boutons) |
| TTS | ElevenLabs *with timestamps* (alignement → sous‑titres + lip‑sync), cache | texte seul |
| STT | ElevenLabs Scribe (audio envoyé à l'API, jamais stocké) | saisie texte |
| Images Leif | OpenAI `gpt-image` via script | — |
| QR | `qrcode` côté API | — |
| Temps réel écrans | polling court (pas de websocket) | — |

Tout doit **fonctionner en dev sans aucune clé API** (mode dégradé), les clés activent les briques IA.

## 8. Jalons

- ≈ 2 nov. : liste invités + QR prêts pour impression
- ≈ 9 nov. : page d'inscription avec Leif en ligne
- ≈ 12 nov. : envoi des cartons
- 1er déc. : répétition générale sur place
- 3 déc. : jour J
