<div align="center">
  <img src="assets/free-chat-banner.svg" alt="FREE CHAT — Entre nous, les gamers" width="100%" />
  <h1>FREE CHAT</h1>
  <p><strong>Entre nous, les gamers.</strong></p>
  <p>Une messagerie communautaire pensée pour les joueurs, sur mobile et ordinateur.</p>
  <p>
    <img alt="Statut" src="https://img.shields.io/badge/statut-en%20construction-8B5CF6?style=for-the-badge" />
    <img alt="PWA" src="https://img.shields.io/badge/PWA-installable-06B6D4?style=for-the-badge" />
    <img alt="Budget" src="https://img.shields.io/badge/modèle-free--first-22C55E?style=for-the-badge" />
  </p>
</div>

---

## ✦ L'idée

FREE CHAT veut offrir aux joueurs un endroit où discuter, retrouver leur escouade, créer des guildes et faire vivre leur communauté. L'expérience est conçue pour être rapide, lisible et agréable sur téléphone comme sur ordinateur.

### État des fonctionnalités

| Espace | Fonctionnalités présentes | État réel |
| --- | --- | --- |
| **Comptes** | Inscription et connexion par e-mail avec Supabase Auth | Code intégré; configuration SMTP et test multi-comptes à faire |
| **Messages** | Conversations directes, envoi, historique et Realtime | Connecté à Supabase; test avec deux comptes requis |
| **Guildes** | Création, liste publique et adhésion | Connecté à Supabase; test multi-comptes requis |
| **Découvrir** | Publications, commentaires, réactions et signalements | Connecté à Supabase; test réel requis |
| **Administration** | Statistiques, joueurs récents, revue des signalements et retrait de publications | Interface protégée par `app_metadata.role`; attribution OWNER à effectuer |
| **PWA** | Manifeste, service worker et interface responsive | Base ajoutée; installation à vérifier sur appareils |
| **Sécurité** | RLS sur les tables publiques et règles par utilisateur | Conseiller de sécurité Supabase sans alerte au dernier contrôle |

Les contrôles de code et de base de données ne remplacent pas les tests réels avec plusieurs comptes. Le projet n'est pas encore déclaré prêt pour une ouverture publique.

## 🎮 Direction artistique

- Interface sombre premium, avec une future variante claire.
- Cyan électrique, violet néon et accents dorés.
- Effets lumineux discrets, surfaces vitrées et animations sobres.
- Navigation pensée pour le tactile et les petits écrans.
- Vocabulaire gamer : guildes, escouades, joueurs et salons.

## 🧰 Technologies

- **React 18** + **Vite**
- **CSS** responsive
- **Supabase** prévu pour Auth, PostgreSQL, Realtime et Storage
- **Netlify** prévu pour l'hébergement
- **PWA** avec manifeste et cache de base

## 🚀 Lancer le projet

Prérequis : Node.js 20 ou version compatible et npm.

```bash
git clone https://github.com/ooopppmarcelle-glitch/free-chat.git
cd free-chat
npm install
cp .env.example .env
npm run dev
```

Ouvre ensuite l'adresse locale indiquée par Vite.

### Configuration Supabase

Le fichier `.env.example` présente les variables attendues :

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Laisse-les vides pour consulter l'aperçu local. Pour connecter un projet Supabase, renseigne uniquement l'URL et la clé publique anon/publishable. **Ne place jamais une clé `service_role` dans le frontend ou dans GitHub.**

Les politiques RLS devront être définies et testées avant d'activer les données personnelles ou les échanges privés.

## 🗄️ Base de données Supabase

Le schéma appliqué au projet Supabase est conservé dans [`supabase/schema.sql`](supabase/schema.sql). Il couvre les profils, guildes, membres, conversations, messages, publications, commentaires, réactions et signalements. Les dix tables ont la Row Level Security (RLS) activée. Les politiques de modération utilisent exclusivement `app_metadata.role`, jamais les métadonnées modifiables par le joueur. Les règles doivent encore être testées avec plusieurs comptes avant l'ouverture publique.

## 🛡️ Sécurité et transparence

- Les fonctions sont annoncées comme disponibles uniquement après implémentation et test.
- Les comptes, messages privés, notifications push et modération réelle ne sont pas encore activés dans cette première base.
- L'UID Free Fire ne constitue pas une preuve d'identité Garena.
- FREE CHAT est un projet indépendant, non affilié à Garena et non officiel.

## 📋 Rapport de vérification

Le suivi détaillé des contrôles, limites connues et étapes restantes est publié dans [le rapport de vérification](docs/rapport-de-verification.md). La procédure d'attribution du rôle propriétaire est décrite dans [OWNER_SETUP.md](docs/OWNER_SETUP.md).

## 🗺️ Feuille de route

1. Finaliser l'attribution sécurisée du rôle OWNER après création du premier compte.
2. Vérifier la compilation GitHub Actions et corriger toute erreur détectée.
3. Tester inscription, connexion, messages, guildes, publications, commentaires, réactions et signalements avec au moins deux comptes.
4. Configurer un SMTP fiable pour les e-mails de confirmation.
5. Configurer l'hébergement Netlify et les variables publiques Supabase.
6. Vérifier l'installation PWA et le comportement mobile.
7. Préparer l'ouverture publique après validation de sécurité.

## 🤝 Contributions

Les retours sont les bienvenus : bugs d'affichage, problèmes d'accessibilité, idées de fonctionnalités et améliorations de traduction. Merci de décrire les étapes pour reproduire un problème.

## ✨ Crédit

**Farel — Free Chat Studio**

*Une communauté. Une escouade. Ton univers.*
