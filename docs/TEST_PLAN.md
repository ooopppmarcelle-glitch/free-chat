# FREE CHAT — Plan de test manuel

Effectuer ces tests après la compilation verte et après avoir créé deux comptes distincts.

## Préparation

- Compte A : compte propriétaire, rôle OWNER attribué dans `app_metadata`.
- Compte B : compte joueur standard.
- Ouvrir deux navigateurs ou deux sessions distinctes pour éviter de mélanger les comptes.

## Authentification

1. Créer les deux comptes avec des adresses distinctes.
2. Confirmer les adresses e-mail si la confirmation est activée.
3. Se connecter et se déconnecter de chaque compte.
4. Vérifier qu'un joueur non connecté ne voit pas l'espace privé de l'application.

## Publications, commentaires et réactions

1. A publie une publication.
2. Actualiser la page et vérifier que la publication reste présente.
3. B ouvre le fil et vérifie qu'il voit la publication de A.
4. B ajoute un commentaire; A vérifie qu'il apparaît sans recharger.
5. B ajoute une réaction; vérifier que le compteur augmente chez A et B.
6. B retire sa réaction; vérifier que le compteur diminue.
7. B signale la publication avec une raison explicite.
8. A vérifie que le signalement apparaît dans Administration.
9. A passe le signalement à « Examiner », puis « Résoudre ».
10. Tester « Retirer la publication » sur une publication de test et vérifier la disparition du post, de ses commentaires et de ses réactions.

## Guildes

1. A crée une guilde publique.
2. B la retrouve dans la liste et la rejoint.
3. Actualiser les deux sessions et vérifier que l'adhésion est persistante.
4. Vérifier qu'un joueur ne peut pas rejoindre une guilde privée par une requête non autorisée.

## Messagerie

1. A démarre une conversation directe avec le pseudo exact de B.
2. A envoie un message texte.
3. B vérifie la réception en temps réel et répond.
4. Actualiser les deux sessions et vérifier la persistance de l'historique.
5. Vérifier qu'un troisième compte qui n'est pas membre ne peut pas lire cette conversation.

## Administration

1. Se connecter avec le compte A dont le rôle OWNER est dans `app_metadata`.
2. Vérifier la présence du menu Administration.
3. Vérifier les compteurs joueurs, publications, guildes et signalements ouverts.
4. Vérifier les joueurs récents et les signalements.
5. Se connecter avec B et vérifier que le menu Administration est absent et que les requêtes de modération sont refusées.

## PWA et affichage

1. Ouvrir FREE CHAT sur Android avec Chrome.
2. Vérifier la mise en page en portrait et paysage.
3. Utiliser « Ajouter à l'écran d'accueil » si le navigateur le propose.
4. Ouvrir l'application depuis son icône et vérifier le chargement.
5. Tester aussi sur un écran d'ordinateur.

Noter chaque anomalie avec le compte utilisé, la page, l'action effectuée et le message d'erreur exact. Ne pas publier de mot de passe, de clé API ou de jeton dans un rapport.
