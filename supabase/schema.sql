-- FREE CHAT database schema
-- Snapshot of the schema applied to Supabase project gsxcobdgxuwndflmshai.
-- Keep credentials out of this file. Use environment variables for the frontend.
-- Realtime publication: public.messages and public.posts are enabled separately for live updates.

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 24),
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 240),
  free_fire_uid text unique,
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guilds (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 32),
  description text not null default '' check (char_length(description) <= 500),
  owner_id uuid not null references auth.users(id) on delete restrict,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.guild_members (
  guild_id uuid not null references public.guilds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('member','officer')),
  joined_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'direct' check (kind in ('direct','group')),
  title text check (title is null or char_length(title) between 1 and 48),
  created_by uuid not null references auth.users(id) on delete restrict,
  participant_one uuid references auth.users(id) on delete cascade,
  participant_two uuid references auth.users(id) on delete cascade,
  constraint conversations_direct_participants_check check (
    kind <> 'direct' or (
      participant_one is not null and participant_two is not null
      and participant_one <> participant_two
      and created_by in (participant_one, participant_two)
    )
  ),
  created_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null default 'like' check (reaction_type in ('like','fire','gg','wow')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('profile','message','post','guild')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create index conversations_created_by_idx on public.conversations(created_by);
create index conversations_participant_one_idx on public.conversations(participant_one);
create index conversations_participant_two_idx on public.conversations(participant_two);
create index reports_reporter_id_idx on public.reports(reporter_id);
create index guilds_owner_id_idx on public.guilds(owner_id);
create index guild_members_user_id_idx on public.guild_members(user_id);
create index conversation_members_user_id_idx on public.conversation_members(user_id);
create index messages_conversation_created_idx on public.messages(conversation_id, created_at desc);
create index messages_sender_id_idx on public.messages(sender_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index posts_author_id_idx on public.posts(author_id);
create index post_comments_post_created_idx on public.post_comments(post_id, created_at asc);
create index post_comments_author_id_idx on public.post_comments(author_id);
create index post_reactions_post_idx on public.post_reactions(post_id);
create index post_reactions_user_idx on public.post_reactions(user_id);
create index reports_status_created_idx on public.reports(status, created_at desc);

alter table public.profiles enable row level security;
alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_reactions enable row level security;
alter table public.reports enable row level security;

-- Run once in Supabase to enable live community feed updates:
-- alter publication supabase_realtime add table public.posts;
-- alter publication supabase_realtime add table public.post_comments;
-- alter publication supabase_realtime add table public.post_reactions;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.guilds to authenticated;
grant select, insert, update, delete on public.guild_members to authenticated;
grant select, insert on public.conversations to authenticated;
grant select, insert, delete on public.conversation_members to authenticated;
grant select, insert, update, delete on public.messages to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, delete on public.post_comments to authenticated;
grant select, insert, delete on public.post_reactions to authenticated;
grant select, insert, update on public.reports to authenticated;

create policy "Profiles visible to signed-in players"
on public.profiles for select to authenticated using (true);
create policy "Players create their own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Players update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Public guilds and owned guilds are visible"
on public.guilds for select to authenticated
using (is_public or owner_id = (select auth.uid()));
create policy "Players create guilds as owner"
on public.guilds for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "Guild owners update their guild"
on public.guilds for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));
create policy "Guild owners delete their guild"
on public.guilds for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "Guild members visible to guild members"
on public.guild_members for select to authenticated
using (user_id = (select auth.uid()));
create policy "Players join public guilds or their own guild"
on public.guild_members for insert to authenticated
with check (
  user_id = (select auth.uid())
  and member_role = 'member'
  and exists (
    select 1 from public.guilds g
    where g.id = guild_id
      and (g.is_public or g.owner_id = (select auth.uid()))
  )
);
create policy "Guild owners remove memberships"
on public.guild_members for delete to authenticated
using (
  exists (select 1 from public.guilds g where g.id = guild_id and g.owner_id = (select auth.uid()))
  or user_id = (select auth.uid())
);

create policy "Conversation visible to creator or its members"
on public.conversations for select to authenticated
using (
  created_by = (select auth.uid())
  or exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = id and cm.user_id = (select auth.uid())
  )
);
create policy "Players create conversations"
on public.conversations for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (
    kind = 'group'
    or (
      participant_one is not null and participant_two is not null
      and participant_one <> participant_two
      and (select auth.uid()) in (participant_one, participant_two)
    )
  )
);
create policy "Players see their own conversation membership"
on public.conversation_members for select to authenticated
using (user_id = (select auth.uid()));
create policy "Conversation creator adds participants"
on public.conversation_members for insert to authenticated
with check (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and c.created_by = (select auth.uid())
      and (c.kind = 'group' or user_id in (c.participant_one, c.participant_two))
  )
);
create policy "Conversation creator or player leaves"
on public.conversation_members for delete to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.created_by = (select auth.uid())
  )
);

create policy "Messages visible only to conversation members"
on public.messages for select to authenticated
using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = conversation_id and cm.user_id = (select auth.uid())
  )
);
create policy "Members send messages as themselves"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = conversation_id and cm.user_id = (select auth.uid())
  )
);
create policy "Players edit their own messages"
on public.messages for update to authenticated
using (sender_id = (select auth.uid()))
with check (sender_id = (select auth.uid()));
create policy "Players delete their own messages"
on public.messages for delete to authenticated
using (sender_id = (select auth.uid()));

create policy "Signed-in players read community posts"
on public.posts for select to authenticated using (true);
create policy "Players publish their own posts"
on public.posts for insert to authenticated
with check (author_id = (select auth.uid()));
create policy "Players update their own posts"
on public.posts for update to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));
create policy "Players and moderators delete community posts"
on public.posts for delete to authenticated
using (
  author_id = (select auth.uid())
  or (select auth.jwt())->'app_metadata'->>'role' in ('owner','admin','moderator')
);

create policy "Signed-in players read comments on community posts"
on public.post_comments for select to authenticated
using (exists (select 1 from public.posts p where p.id = post_id));
create policy "Players comment as themselves"
on public.post_comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and exists (select 1 from public.posts p where p.id = post_id)
);
create policy "Players and moderators delete community comments"
on public.post_comments for delete to authenticated
using (
  author_id = (select auth.uid())
  or (select auth.jwt())->'app_metadata'->>'role' in ('owner','admin','moderator')
);

create policy "Signed-in players read post reactions"
on public.post_reactions for select to authenticated
using (exists (select 1 from public.posts p where p.id = post_id));
create policy "Players react as themselves"
on public.post_reactions for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.posts p where p.id = post_id)
);
create policy "Players remove their own reactions"
on public.post_reactions for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Moderators remove community posts"
on public.posts for delete to authenticated
using ((auth.jwt()->'app_metadata'->>'role') in ('owner','admin','moderator'));
create policy "Moderators remove community comments"
on public.post_comments for delete to authenticated
using ((auth.jwt()->'app_metadata'->>'role') in ('owner','admin','moderator'));

create policy "Players submit reports about themselves"
on public.reports for insert to authenticated
with check (reporter_id = (select auth.uid()));
create policy "Players and moderators view reports"
on public.reports for select to authenticated
using (
  reporter_id = (select auth.uid())
  or ((select auth.jwt())->'app_metadata'->>'role') in ('owner','admin','moderator')
);
create policy "Moderators update report status"
on public.reports for update to authenticated
using ((auth.jwt()->'app_metadata'->>'role') in ('owner','admin','moderator'))
with check ((auth.jwt()->'app_metadata'->>'role') in ('owner','admin','moderator'));
