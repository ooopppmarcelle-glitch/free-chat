# Attribution du rôle OWNER

Le rôle propriétaire est stocké dans `auth.users.raw_app_meta_data` (exposé au client via `user.app_metadata`). Il ne doit jamais être placé dans `user_metadata`, car un joueur peut modifier ses propres métadonnées de profil.

## Étapes

1. Créer ton compte FREE CHAT depuis l'écran d'inscription avec ton adresse e-mail.
2. Confirmer l'adresse e-mail si la confirmation est activée, puis te connecter une première fois.
3. Ouvrir le projet Supabase, puis **Authentication → Users**.
4. Copier l'UUID du compte que tu viens de créer.
5. Dans **SQL Editor**, exécuter la requête ci-dessous en remplaçant uniquement `REMPLACER_PAR_UUID` par cet UUID.

```sql
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'owner')
where id = 'REMPLACER_PAR_UUID'::uuid;

select id, raw_app_meta_data
from auth.users
where id = 'REMPLACER_PAR_UUID'::uuid;
```

6. Vérifier que le résultat contient `"role": "owner"`.
7. Se déconnecter de FREE CHAT, puis se reconnecter afin de renouveler le jeton d'accès.

Le menu **Administration** doit alors apparaître. Ne donne jamais le rôle OWNER à un autre compte. Pour les autres membres de l'équipe, utiliser uniquement les rôles `admin` ou `moderator` après vérification de leur identité et de leurs responsabilités.

## État actuel

Au dernier contrôle du 15 novembre 2026, le projet Supabase ne contenait encore aucun utilisateur. Le rôle OWNER ne peut donc pas être attribué avant la création du premier compte.
