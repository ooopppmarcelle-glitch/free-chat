# FREE CHAT — Rapport de vérification

**Date :** 15 novembre 2026  
**Dépôt :** [ooopppmarcelle-glitch/free-chat](https://github.com/ooopppmarcelle-glitch/free-chat)  
**Base :** Supabase `gsxcobdgxuwndflmshai`

## Synthèse

Le projet dispose maintenant d'une base de messagerie, de guildes et d'une communauté connectées à Supabase. Les fonctionnalités de publications, commentaires, réactions et signalements ont leur logique applicative et leurs tables dédiées. Un tableau de bord de modération est intégré et protégé par les rôles de `app_metadata`.

**Le projet n'est pas encore déclaré prêt pour une mise en production.** Aucun compte utilisateur n'existe encore dans la base (contrôle : 0 utilisateur, 0 profil, 0 publication, 0 guilde et 0 signalement). Par conséquent, les parcours réels de connexion, publication, messagerie entre deux joueurs et administration n'ont pas pu être validés avec des comptes actifs.

## Éléments implémentés

- Authentification e-mail/mot de passe et création de profil.
- Conversations directes, envoi et réception de messages avec Supabase Realtime.
- Création de guildes publiques et adhésion.
- Publications communautaires persistantes.
- Commentaires persistants avec mise à jour Realtime.
- Réactions persistantes (une réaction par joueur et par publication) avec compteur partagé.
- Signalement de publications.
- Tableau de bord : statistiques, joueurs récents, liste des signalements et mise à jour de leur statut.
- Retrait de publications signalées par un modérateur autorisé.
- Navigation Administration conditionnée au rôle `owner`, `admin` ou `moderator` dans `app_metadata.role`.

## Contrôles de base de données

- 10 tables publiques recensées.
- RLS activée sur les 10 tables.
- Règles vérifiées pour les publications, commentaires, réactions et signalements.
- Publications Realtime : `posts`, `post_comments`, `post_reactions`; messages Realtime également configurés.
- Conseiller de sécurité Supabase : **aucune alerte** au dernier contrôle.
- Conseiller de performance : avertissements d'index non utilisés (attendus sur une base vide). Les avertissements de politiques de suppression multiples ont été corrigés.

## État des tests

| Vérification | État |
| --- | --- |
| Contrôle des fichiers et des fonctions ajoutées | Effectué par inspection |
| Contrôle des politiques RLS | Effectué |
| Contrôle des publications Realtime | Effectué |
| Conseiller de sécurité Supabase | Aucun avertissement |
| Compilation Vite sur GitHub Actions | À confirmer dans l'onglet Actions; aucun résultat de build vérifiable ici |
| Inscription réelle et confirmation e-mail | Non testées |
| Test de publication avec un compte connecté | Non testable sans compte |
| Commentaires et réactions entre deux comptes | Non testés |
| Messagerie entre deux comptes | Non testée |
| Création/adhésion à une guilde entre deux comptes | Non testée |
| Tableau de bord avec compte OWNER réel | Non testable sans compte OWNER |
| Installation PWA sur téléphone | À tester |

## Compte propriétaire

Le projet ne contient actuellement aucun utilisateur : `auth.users = 0`, `profiles = 0`. L'attribution OWNER est donc en attente. La procédure manuelle sécurisée est documentée dans [OWNER_SETUP.md](OWNER_SETUP.md). Le rôle est stocké dans `app_metadata`, jamais dans les métadonnées modifiables par le joueur.

## Liens de contrôle

- [Ouvrir les exécutions GitHub Actions](https://github.com/ooopppmarcelle-glitch/free-chat/actions)
- [Consulter les commits récents](https://github.com/ooopppmarcelle-glitch/free-chat/commits/main)
- [Guide d'attribution OWNER](OWNER_SETUP.md)
- [Plan de test manuel](TEST_PLAN.md)

## Procédure pour vérifier la compilation

1. Ouvrir le dépôt GitHub.
2. Appuyer sur l'onglet **Actions**.
3. Ouvrir le workflow **Build check**.
4. Appuyer sur **Run workflow**, choisir la branche `main`, puis confirmer avec **Run workflow**.
5. Attendre la fin du job **build**.
6. Une coche verte signifie que `npm install` et `npm run build` ont réussi pour le commit affiché. Une croix rouge signifie qu'il faut ouvrir le job et lire l'étape en erreur.

La compilation doit être vérifiée sur le dernier commit, pas sur un ancien run. Le workflow est déclenché automatiquement à chaque push sur `main`. Le workflow accepte aussi un lancement manuel depuis l'onglet Actions grâce à l'événement `workflow_dispatch`.

## Prochaines actions obligatoires

1. Confirmer le résultat du workflow Build check.
2. Créer le premier compte, confirmer l'adresse e-mail et attribuer le rôle OWNER.
3. Configurer un SMTP personnalisé avant un lancement public.
4. Tester les fonctionnalités avec deux comptes indépendants.
5. Configurer l'hébergement et les variables d'environnement Supabase sur Netlify.
6. Tester sur Android et vérifier l'installation PWA.
7. Corriger toute anomalie constatée avant d'ouvrir le service au public.

---
Rapport de transparence : une fonctionnalité présente dans le code n'est pas considérée comme validée en conditions réelles tant que son parcours utilisateur n'a pas été testé.
