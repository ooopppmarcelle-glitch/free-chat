import { useEffect, useMemo, useState } from 'react';
import {
  MessageCircle, Users, Compass, Bell, Search, Plus, Send, Smile, ArrowLeft,
  Paperclip, MoreHorizontal, Hash, ChevronDown, Gamepad2, ShieldCheck, Sun, Moon,
  Sparkles, Settings, Menu, X, ArrowUpRight, Zap, Crown, Image,
  CircleHelp, LogOut, CheckCheck, Mic, Phone, Video, UserPlus
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';
import AuthGate from './AuthGate.jsx';

const initialChats = [
  { id: 1, name: 'KAYZER', tag: 'Escouade principale', avatar: 'K', color: 'cyan', online: true, unread: 2, last: 'On lance une partie ce soir ?', time: '12:42' },
  { id: 2, name: 'Mina FF', tag: 'Amie', avatar: 'M', color: 'violet', online: true, unread: 0, last: 'Bien joué pour la dernière game 🔥', time: '11:58' },
  { id: 3, name: 'SQUAD 237', tag: 'Guilde · 18 joueurs', avatar: 'S', color: 'gold', online: false, unread: 0, last: 'DARK: rendez-vous à 20h', time: 'Hier' },
  { id: 4, name: 'Noxx', tag: 'Joueur', avatar: 'N', color: 'pink', online: false, unread: 0, last: 'Tu as vu le nouvel événement ?', time: 'Hier' }
];

const initialMessages = {
  1: [
    { id: 1, from: 'KAYZER', text: 'Yo la team ! Vous êtes chauds pour ce soir ?', time: '12:34', mine: false },
    { id: 2, from: 'Moi', text: 'Toujours prêt. On se retrouve dans le lobby.', time: '12:36', mine: true },
    { id: 3, from: 'KAYZER', text: 'Parfait. Mina vient aussi.', time: '12:38', mine: false },
    { id: 4, from: 'KAYZER', text: 'On lance une partie ce soir ?', time: '12:42', mine: false }
  ],
  2: [{ id: 1, from: 'Mina FF', text: 'Bien joué pour la dernière game 🔥', time: '11:58', mine: false }],
  3: [{ id: 1, from: 'DARK', text: 'Rendez-vous à 20h pour le tournoi interne.', time: 'Hier', mine: false }],
  4: [{ id: 1, from: 'Noxx', text: 'Tu as vu le nouvel événement ?', time: 'Hier', mine: false }]
};

const guilds = [
  { name: 'SQUAD 237', members: '18 joueurs', status: 'Recrutement ouvert', color: 'gold', icon: 'S' },
  { name: 'NIGHT RAIDERS', members: '42 joueurs', status: 'Guilde active', color: 'violet', icon: 'N' },
  { name: 'CAMEROON ELITE', members: '27 joueurs', status: '3 joueurs en ligne', color: 'cyan', icon: 'C' }
];

const initialPosts = [
  { author: 'Mina FF', time: 'Il y a 18 min', avatar: 'M', color: 'violet', text: 'La meilleure sensation : une escouade qui joue ensemble et ne lâche rien. GG à tous !', likes: 24, comments: 6, label: 'COMMUNAUTÉ' },
  { author: 'KAYZER', time: 'Il y a 1 h', avatar: 'K', color: 'cyan', text: 'Qui est chaud pour former une escouade ce week-end ? On cherche deux joueurs motivés.', likes: 13, comments: 9, label: 'RECRUTEMENT' }
];

function Avatar({ label, color = 'cyan', online = false, large = false }) {
  return <span className={`avatar avatar-${color} ${large ? 'avatar-large' : ''}`}>{label}<i className={online ? 'online-dot' : 'offline-dot'} /></span>;
}

function Workspace() {
  const [account, setAccount] = useState(null);
  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) setAccount(data.user || null); });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => setAccount(session?.user || null));
    return () => { active = false; authListener.subscription.unsubscribe(); };
  }, []);
  const gamerName = account?.user_metadata?.display_name || account?.user_metadata?.username || 'Joueur';
  const gamerTag = account?.user_metadata?.username ? `@${account.user_metadata.username}` : account?.email || 'Compte connecté';
  const [section, setSection] = useState('messages');
  const [lightMode, setLightMode] = useState(false);
  const [activeChat, setActiveChat] = useState(1);
  const [chats, setChats] = useState(initialChats);
  const [messages, setMessages] = useState(initialMessages);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newPlayerUsername, setNewPlayerUsername] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [notice, setNotice] = useState('');
  const [communityPosts, setCommunityPosts] = useState(initialPosts);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [postDraft, setPostDraft] = useState('');
  const [commentsByPost, setCommentsByPost] = useState({});
  const [expandedComments, setExpandedComments] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [sendingComment, setSendingComment] = useState(null);
  const [reactionsByPost, setReactionsByPost] = useState({});
  const [reactionBusy, setReactionBusy] = useState(null);
  const [adminStats, setAdminStats] = useState({ players: 0, posts: 0, guilds: 0, openReports: 0 });
  const [adminReports, setAdminReports] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [showNewGuild, setShowNewGuild] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [localGuilds, setLocalGuilds] = useState(guilds);
  const [guildDescription, setGuildDescription] = useState('');
  const [loadingGuilds, setLoadingGuilds] = useState(false);


  useEffect(() => {
    if (!account?.id || !supabase) return;
    let active = true;
    async function loadChats() {
      setLoadingChats(true);
      const { data: memberships, error: membershipError } = await supabase.from('conversation_members').select('conversation_id').eq('user_id', account.id);
      if (membershipError) { if (active) notify('Impossible de charger tes discussions : ' + membershipError.message); setLoadingChats(false); return; }
      const ids = [...new Set((memberships || []).map((item) => item.conversation_id))];
      if (!ids.length) { if (active) { setChats([]); setActiveChat(null); } setLoadingChats(false); return; }
      const { data: conversations, error: conversationError } = await supabase.from('conversations').select('id, kind, title, participant_one, participant_two, created_at').in('id', ids).order('created_at', { ascending: false });
      if (conversationError) { if (active) notify('Erreur de chargement : ' + conversationError.message); setLoadingChats(false); return; }
      const otherIds = [...new Set((conversations || []).map((item) => item.participant_one === account.id ? item.participant_two : item.participant_one).filter(Boolean))];
      const [{ data: profiles }, { data: recentMessages }] = await Promise.all([
        supabase.from('profiles').select('user_id, username, display_name, avatar_url').in('user_id', otherIds),
        supabase.from('messages').select('id, conversation_id, sender_id, body, created_at').in('conversation_id', ids).order('created_at', { ascending: false })
      ]);
      const profileById = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
      const latestByConversation = new Map();
      (recentMessages || []).forEach((message) => { if (!latestByConversation.has(message.conversation_id)) latestByConversation.set(message.conversation_id, message); });
      const mapped = (conversations || []).map((conversation) => {
        const otherId = conversation.participant_one === account.id ? conversation.participant_two : conversation.participant_one;
        const profile = profileById.get(otherId);
        const latest = latestByConversation.get(conversation.id);
        const label = profile?.display_name || profile?.username || 'Joueur';
        return { id: conversation.id, name: label, tag: '@' + (profile?.username || 'joueur'), avatar: label.slice(0, 1).toUpperCase(), color: 'cyan', online: false, unread: 0, last: latest?.body || 'Nouvelle discussion', time: latest ? new Date(latest.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Nouveau', otherId };
      });
      if (active) {
        setChats(mapped);
        setActiveChat((current) => mapped.some((chat) => chat.id === current) ? current : (mapped[0]?.id || null));
      }
      setLoadingChats(false);
    }
    loadChats();
    return () => { active = false; };
  }, [account?.id]);

  useEffect(() => {
    if (!account?.id || !supabase || !activeChat || typeof activeChat !== 'string') return;
    let active = true;
    supabase.from('messages').select('id, sender_id, body, created_at').eq('conversation_id', activeChat).order('created_at', { ascending: true }).then(({ data, error }) => {
      if (!active) return;
      if (error) { notify('Impossible de charger les messages : ' + error.message); return; }
      setMessages((previous) => ({ ...previous, [activeChat]: (data || []).map((message) => ({
        id: message.id, from: message.sender_id === account.id ? gamerName : (currentChat?.name || 'Joueur'),
        text: message.body, time: new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        mine: message.sender_id === account.id
      })) }));
    });
    const channel = supabase.channel('free-chat-messages-' + activeChat)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + activeChat }, ({ new: message }) => {
        if (!active || !message?.id) return;
        setMessages((previous) => {
          const existing = previous[activeChat] || [];
          if (existing.some((item) => item.id === message.id)) return previous;
          return { ...previous, [activeChat]: [...existing, {
            id: message.id, from: message.sender_id === account.id ? gamerName : (currentChat?.name || 'Joueur'),
            text: message.body, time: new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            mine: message.sender_id === account.id
          }] };
        });
      }).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [account?.id, activeChat]);

  async function startDirectConversation(event) {
    event.preventDefault();
    if (!account?.id || !supabase) return;
    const username = newPlayerUsername.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(username)) { notify('Entre un pseudo valide (3 à 24 caractères).'); return; }
    const { data: target, error: lookupError } = await supabase.from('profiles').select('user_id, username, display_name').eq('username', username).maybeSingle();
    if (lookupError) { notify('Recherche impossible : ' + lookupError.message); return; }
    if (!target) { notify('Aucun joueur trouvé avec ce pseudo.'); return; }
    if (target.user_id === account.id) { notify('Tu ne peux pas démarrer une discussion avec toi-même.'); return; }
    const { data: conversation, error: createError } = await supabase.from('conversations').insert({ kind: 'direct', created_by: account.id, participant_one: account.id, participant_two: target.user_id }).select('id').single();
    if (createError) { notify('Création impossible : ' + createError.message); return; }
    const { error: membersError } = await supabase.from('conversation_members').insert([
      { conversation_id: conversation.id, user_id: account.id },
      { conversation_id: conversation.id, user_id: target.user_id }
    ]);
    if (membersError) { notify('Discussion créée, mais ajout du joueur impossible : ' + membersError.message); return; }
    setShowNewChat(false);
    setNewPlayerUsername('');
    await refreshConversations();
    setActiveChat(conversation.id);
    setShowChatOnMobile(true);
    notify('Discussion créée avec ' + (target.display_name || target.username) + '.');
  }

  async function refreshConversations() {
    if (!account?.id || !supabase) return;
    const { data: memberships } = await supabase.from('conversation_members').select('conversation_id').eq('user_id', account.id);
    const ids = [...new Set((memberships || []).map((item) => item.conversation_id))];
    if (!ids.length) { setChats([]); return; }
    const { data: conversations } = await supabase.from('conversations').select('id, participant_one, participant_two, created_at').in('id', ids).order('created_at', { ascending: false });
    const otherIds = [...new Set((conversations || []).map((item) => item.participant_one === account.id ? item.participant_two : item.participant_one).filter(Boolean))];
    const { data: profiles } = await supabase.from('profiles').select('user_id, username, display_name').in('user_id', otherIds);
    const byId = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
    setChats((conversations || []).map((conversation) => {
      const otherId = conversation.participant_one === account.id ? conversation.participant_two : conversation.participant_one;
      const profile = byId.get(otherId); const label = profile?.display_name || profile?.username || 'Joueur';
      return { id: conversation.id, name: label, tag: '@' + (profile?.username || 'joueur'), avatar: label.slice(0,1).toUpperCase(), color: 'cyan', online: false, unread: 0, last: 'Nouvelle discussion', time: 'Nouveau', otherId };
    }));
  }


  useEffect(() => {
    if (!account?.id || !supabase) return;
    let active = true;
    async function loadGuilds() {
      setLoadingGuilds(true);
      const { data, error } = await supabase.from('guilds')
        .select('id, name, description, owner_id, is_public, created_at')
        .eq('is_public', true).order('created_at', { ascending: false });
      if (!active) return;
      if (error) { notify('Impossible de charger les guildes : ' + error.message); setLoadingGuilds(false); return; }
      const ids = (data || []).map((guild) => guild.id);
      const { data: memberships } = ids.length
        ? await supabase.from('guild_members').select('guild_id').eq('user_id', account.id).in('guild_id', ids)
        : { data: [] };
      const joined = new Set((memberships || []).map((row) => row.guild_id));
      setLocalGuilds((data || []).map((guild) => ({
        id: guild.id, name: guild.name, description: guild.description,
        members: guild.owner_id === account.id ? 'Ta guilde' : (joined.has(guild.id) ? 'Tu es membre' : 'Guilde publique'),
        status: joined.has(guild.id) || guild.owner_id === account.id ? 'Tu fais partie de cette guilde' : 'Rejoindre',
        color: 'cyan', icon: guild.name.slice(0,1).toUpperCase(),
        joined: joined.has(guild.id) || guild.owner_id === account.id, owner: guild.owner_id === account.id
      })));
      setLoadingGuilds(false);
    }
    loadGuilds();
    return () => { active = false; };
  }, [account?.id]);

  useEffect(() => {
    if (!account?.id || !supabase) {
      setCommunityPosts(initialPosts);
      setCommentsByPost({});
      setReactionsByPost({});
      return undefined;
    }
    let active = true;
    async function loadPosts() {
      setLoadingPosts(true);
      const { data, error } = await supabase.from('posts')
        .select('id, author_id, body, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!active) return;
      if (error) {
        notify('Impossible de charger les publications : ' + error.message);
        setLoadingPosts(false);
        return;
      }
      const postIds = (data || []).map((post) => post.id);
      const commentResult = postIds.length
        ? await supabase.from('post_comments')
            .select('id, post_id, author_id, body, created_at')
            .in('post_id', postIds)
            .order('created_at', { ascending: true })
        : { data: [], error: null };
      if (!active) return;
      if (commentResult.error) notify('Impossible de charger les commentaires : ' + commentResult.error.message);
      const reactionResult = postIds.length
        ? await supabase.from('post_reactions')
            .select('id, post_id, user_id, reaction_type')
            .in('post_id', postIds)
        : { data: [], error: null };
      if (!active) return;
      if (reactionResult.error) notify('Impossible de charger les réactions : ' + reactionResult.error.message);
      const authorIds = [...new Set([
        ...(data || []).map((post) => post.author_id),
        ...(commentResult.data || []).map((comment) => comment.author_id)
      ])];
      const { data: profiles, error: profilesError } = authorIds.length
        ? await supabase.from('profiles').select('user_id, username, display_name, avatar_url').in('user_id', authorIds)
        : { data: [], error: null };
      if (!active) return;
      if (profilesError) notify('Profils des auteurs indisponibles : ' + profilesError.message);
      const profileById = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
      setCommunityPosts((data || []).map((post) => {
        const profile = profileById.get(post.author_id);
        const author = profile?.display_name || profile?.username || 'Joueur';
        return {
          id: post.id, authorId: post.author_id, author,
          avatar: author.slice(0, 1).toUpperCase(), color: 'cyan',
          time: new Date(post.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
          text: post.body, likes: 0, comments: 0, label: 'COMMUNAUTÉ'
        };
      }));
      const groupedComments = {};
      (commentResult.data || []).forEach((comment) => {
        const profile = profileById.get(comment.author_id);
        const author = profile?.display_name || profile?.username || 'Joueur';
        if (!groupedComments[comment.post_id]) groupedComments[comment.post_id] = [];
        groupedComments[comment.post_id].push({
          id: comment.id, authorId: comment.author_id, author,
          avatar: author.slice(0, 1).toUpperCase(), body: comment.body,
          time: new Date(comment.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
        });
      });
      setCommentsByPost(groupedComments);
      const groupedReactions = {};
      (reactionResult.data || []).forEach((reaction) => {
        if (!groupedReactions[reaction.post_id]) groupedReactions[reaction.post_id] = { count: 0, mine: false };
        groupedReactions[reaction.post_id].count += 1;
        if (reaction.user_id === account.id) groupedReactions[reaction.post_id].mine = true;
      });
      setReactionsByPost(groupedReactions);
      setLoadingPosts(false);
    }
    loadPosts();
    const channel = supabase.channel('free-chat-community-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => { loadPosts(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => { loadPosts(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, () => { loadPosts(); })
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [account?.id]);

  async function toggleReaction(postId) {
    if (!account?.id || !supabase) {
      notify('Connecte-toi pour réagir à une publication.');
      return;
    }
    if (reactionBusy === postId) return;
    const current = reactionsByPost[postId] || { count: 0, mine: false };
    setReactionBusy(postId);
    const result = current.mine
      ? await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', account.id)
      : await supabase.from('post_reactions').insert({ post_id: postId, user_id: account.id, reaction_type: 'fire' });
    if (result.error) {
      notify('Réaction non enregistrée : ' + result.error.message);
      setReactionBusy(null);
      return;
    }
    setReactionsByPost((previous) => ({
      ...previous,
      [postId]: { count: Math.max(0, (previous[postId]?.count || 0) + (current.mine ? -1 : 1)), mine: !current.mine }
    }));
    setReactionBusy(null);
  }

  function toggleComments(postId) {
    setExpandedComments((previous) => previous.includes(postId)
      ? previous.filter((id) => id !== postId)
      : [...previous, postId]);
    if (!account?.id) notify('Connecte-toi pour consulter et écrire des commentaires.');
  }

  async function submitComment(event, postId) {
    event.preventDefault();
    const body = (commentDrafts[postId] || '').trim();
    if (!account?.id || !supabase) {
      notify('Connecte-toi pour commenter.');
      return;
    }
    if (!body || body.length > 1000) {
      notify('Ton commentaire doit contenir entre 1 et 1 000 caractères.');
      return;
    }
    setSendingComment(postId);
    const { data: created, error } = await supabase.from('post_comments')
      .insert({ post_id: postId, author_id: account.id, body })
      .select('id, post_id, author_id, body, created_at')
      .single();
    if (error) {
      notify('Commentaire non envoyé : ' + error.message);
      setSendingComment(null);
      return;
    }
    const { data: profile } = await supabase.from('profiles')
      .select('username, display_name')
      .eq('user_id', account.id)
      .maybeSingle();
    const author = profile?.display_name || profile?.username || gamerName;
    setCommentsByPost((previous) => ({
      ...previous,
      [postId]: [...(previous[postId] || []).filter((item) => item.id !== created.id), {
        id: created.id, authorId: created.author_id, author,
        avatar: author.slice(0, 1).toUpperCase(), body: created.body,
        time: new Date(created.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
      }]
    }));
    setCommentDrafts((previous) => ({ ...previous, [postId]: '' }));
    setSendingComment(null);
    notify('Commentaire publié.');
  }

  async function createPost(event) {
    event.preventDefault();
    const body = postDraft.trim();
    if (!account?.id || !supabase) {
      notify('Connecte-toi pour publier dans la communauté.');
      setShowNewPost(false);
      return;
    }
    if (!body || body.length > 3000) {
      notify('Ta publication doit contenir entre 1 et 3 000 caractères.');
      return;
    }
    const { data: created, error } = await supabase.from('posts')
      .insert({ author_id: account.id, body })
      .select('id, author_id, body, created_at')
      .single();
    if (error) {
      notify('Publication non envoyée : ' + error.message);
      return;
    }
    const { data: authorProfile } = await supabase.from('profiles')
      .select('username, display_name')
      .eq('user_id', account.id)
      .maybeSingle();
    const author = authorProfile?.display_name || authorProfile?.username || gamerName;
    setCommunityPosts((previous) => [{
      id: created.id, authorId: created.author_id, author,
      avatar: author.slice(0, 1).toUpperCase(), color: 'cyan',
      time: new Date(created.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      text: created.body, likes: 0, comments: 0, label: 'COMMUNAUTÉ'
    }, ...previous.filter((post) => post.id !== created.id)]);
    setPostDraft('');
    setShowNewPost(false);
    notify('Publication envoyée à la communauté.');
  }

  async function joinGuild(guild) {
    if (!account?.id || !supabase || !guild.id || guild.joined) return;
    const { error } = await supabase.from('guild_members').insert({ guild_id: guild.id, user_id: account.id, member_role: 'member' });
    if (error) { notify(error.code === '23505' ? 'Tu es déjà membre de cette guilde.' : 'Impossible de rejoindre : ' + error.message); return; }
    setLocalGuilds((items) => items.map((item) => item.id === guild.id ? { ...item, joined: true, members: 'Tu es membre', status: 'Tu fais partie de cette guilde' } : item));
    notify('Tu as rejoint ' + guild.name + '.');
  }

  const currentChat = chats.find((chat) => chat.id === activeChat) || chats[0];
  const currentMessages = messages[activeChat] || [];
  const filteredChats = useMemo(
    () => chats.filter((chat) => chat.name.toLowerCase().includes(search.toLowerCase())),
    [chats, search]
  );

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }

  async function loadAdminDashboard() {
    if (!canModerate || !supabase) return;
    setLoadingAdmin(true);
    const [players, posts, guildCount, reports, openReports] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('guilds').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('id, reporter_id, target_type, target_id, reason, status, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open')
    ]);
    const firstError = players.error || posts.error || guildCount.error || reports.error || openReports.error;
    if (firstError) notify('Tableau de bord partiellement chargé : ' + firstError.message);
    setAdminStats({
      players: players.count || 0, posts: posts.count || 0,
      guilds: guildCount.count || 0, openReports: openReports.count || 0
    });
    const reporterIds = [...new Set((reports.data || []).map((report) => report.reporter_id))];
    const { data: profiles } = reporterIds.length
      ? await supabase.from('profiles').select('user_id, username, display_name').in('user_id', reporterIds)
      : { data: [] };
    const profileById = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
    setAdminReports((reports.data || []).map((report) => ({
      ...report,
      reporter: profileById.get(report.reporter_id)?.display_name || profileById.get(report.reporter_id)?.username || 'Joueur'
    })));
    setLoadingAdmin(false);
  }

  useEffect(() => {
    if (section === 'admin' && canModerate) loadAdminDashboard();
  }, [section, userRole]);

  async function updateReportStatus(reportId, status) {
    if (!canModerate || !supabase) return;
    const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);
    if (error) { notify('Mise à jour impossible : ' + error.message); return; }
    setAdminReports((items) => items.map((report) => report.id === reportId ? { ...report, status } : report));
    setAdminStats((previous) => ({
      ...previous,
      openReports: Math.max(0, previous.openReports + (status === 'open' ? 1 : -1))
    }));
    notify('Signalement mis à jour.');
  }

  async function sendMessage(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !currentChat) return;
    if (account?.id && supabase && typeof activeChat === 'string') {
      const { error } = await supabase.from('messages').insert({ conversation_id: activeChat, sender_id: account.id, body });
      if (error) { notify('Message non envoyé : ' + error.message); return; }
      setDraft('');
      const { data } = await supabase.from('messages').select('id, sender_id, body, created_at').eq('conversation_id', activeChat).order('created_at', { ascending: true });
      setMessages((previous) => ({ ...previous, [activeChat]: (data || []).map((message) => ({
        id: message.id, from: message.sender_id === account.id ? gamerName : currentChat.name, text: message.body,
        time: new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), mine: message.sender_id === account.id
      })) }));
      setChats((previous) => previous.map((chat) => chat.id === activeChat ? { ...chat, last: body, time: 'À l’instant' } : chat));
      return;
    }
    const nextMessage = { id: Date.now(), from: 'Moi', text: body, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), mine: true };
    setMessages((previous) => ({ ...previous, [activeChat]: [...(previous[activeChat] || []), nextMessage] }));
    setChats((previous) => previous.map((chat) => chat.id === activeChat ? { ...chat, last: body, time: 'À l’instant' } : chat));
    setDraft('');
  }

  async function createGuild(event) {
    event.preventDefault();
    const name = guildName.trim();
    const description = guildDescription.trim();
    if (name.length < 3 || name.length > 32) { notify('Le nom doit contenir entre 3 et 32 caractères.'); return; }
    if (account?.id && supabase) {
      const { data: created, error } = await supabase.from('guilds').insert({
        name: name.toUpperCase(), description, owner_id: account.id, is_public: true
      }).select('id, name, description, owner_id').single();
      if (error) { notify('Création impossible : ' + error.message); return; }
      const { error: memberError } = await supabase.from('guild_members').insert({
        guild_id: created.id, user_id: account.id, member_role: 'member'
      });
      if (memberError) { notify('Guilde créée, mais adhésion du chef non enregistrée : ' + memberError.message); return; }
      setLocalGuilds((items) => [{ id: created.id, name: created.name, description: created.description, members: 'Ta guilde', status: 'Tu fais partie de cette guilde', color: 'cyan', icon: created.name[0], joined: true, owner: true }, ...items]);
      setGuildName(''); setGuildDescription(''); setShowNewGuild(false);
      notify('Ta guilde a été créée.');
      return;
    }
    setLocalGuilds((previous) => [...previous, { name: name.toUpperCase(), description, members: '1 joueur', status: 'Nouvelle guilde', color: 'cyan', icon: name[0].toUpperCase() }]);
    setGuildName(''); setGuildDescription(''); setShowNewGuild(false);
    notify('Guilde créée dans cette démo.');
  }

  const userRole = account?.app_metadata?.role || null;
  const canModerate = ['owner', 'admin', 'moderator'].includes(userRole);
  const navItems = [
    { id: 'messages', label: 'Messages', icon: MessageCircle, count: 2 },
    { id: 'guildes', label: 'Guildes', icon: Users },
    { id: 'decouvrir', label: 'Découvrir', icon: Compass },
    { id: 'profil', label: 'Mon profil', icon: Gamepad2 },
    ...(canModerate ? [{ id: 'admin', label: 'Administration', icon: ShieldCheck }] : [])
  ];

  return (
    <div className={`app-shell ${lightMode ? 'theme-light' : ''}`}>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><MessageCircle size={22} strokeWidth={2.5} /></div>
          <div><div className="brand-name">FREE<span>CHAT</span></div><div className="brand-caption">ENTRE NOUS, LES GAMERS</div></div>
          <button className="icon-button close-menu" onClick={() => setMobileMenu(false)} aria-label="Fermer le menu"><X size={19} /></button>
        </div>
        <div className="profile-mini">
          <Avatar label="F" color="cyan" online large />
          <div className="profile-mini-text"><strong>{gamerName}</strong><span><i className="status-pulse" /> Compte connecté</span></div>
          <button className="tiny-icon" onClick={() => setSection('profil')} aria-label="Ouvrir mon profil"><MoreHorizontal size={20} /></button>
        </div>
        <div className="side-label">ESPACE GAMER</div>
        <nav className="side-nav">
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button key={id} className={`nav-item ${section === id ? 'nav-active' : ''}`} onClick={() => { setSection(id); setMobileMenu(false); setShowChatOnMobile(false); }}>
              <Icon size={19} /><span>{label}</span>{count ? <b className="nav-count">{count}</b> : null}
            </button>
          ))}
        </nav>
        <div className="side-divider" />
        <div className="side-label side-label-row">TES GUILDES <button onClick={() => { setSection('guildes'); setShowNewGuild(true); }} aria-label="Créer une guilde"><Plus size={15} /></button></div>
        <div className="guild-shortcuts">
          {localGuilds.slice(0, 3).map((guild) => <button key={guild.name} onClick={() => setSection('guildes')}><span className={`guild-symbol symbol-${guild.color}`}>{guild.icon}</span><span>{guild.name}</span></button>)}
        </div>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17} /></div><strong>Ton univers gamer.</strong><p>Un espace pour jouer, échanger et progresser ensemble.</p><span>FREE CHAT STUDIO</span></div>
          <button className="nav-item muted-nav" onClick={() => notify('Les paramètres arrivent dans une prochaine version.')}><Settings size={18} /><span>Paramètres</span></button>
          {supabase && <button className="nav-item muted-nav" onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) notify('Déconnexion impossible : ' + error.message); }}><LogOut size={18} /><span>Se déconnecter</span></button>}
          <div className="sidebar-signature">Créé par <strong>Farel</strong> <span>✦</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Ouvrir le menu"><Menu size={21} /></button>
          <div className="breadcrumb"><span>FREE CHAT</span><b>/</b>{navItems.find((item) => item.id === section)?.label || 'Messages'}</div>
          <div className="top-actions"><div className="connection-pill"><i /> Communauté active</div><button className="icon-button theme-toggle" onClick={() => setLightMode((value) => !value)} aria-label={lightMode ? "Activer le thème sombre" : "Activer le thème clair"}>{lightMode ? <Moon size={18} /> : <Sun size={18} />}</button><button className="icon-button notification-button" onClick={() => notify('Tu es à jour. Aucune nouvelle notification.')} aria-label="Notifications"><Bell size={19} /><i /></button><button className="top-avatar" onClick={() => setSection('profil')}>F</button></div>
        </header>

        {section === 'messages' && (
          <div className={`messenger-layout ${showChatOnMobile ? 'mobile-chat-open' : ''}`}>
            <section className="conversation-panel">
              <div className="panel-heading"><div><div className="eyebrow">TON ESPACE DE COMMUNICATION</div><h1>Messages<span className="title-dot">.</span></h1></div><button className="square-action" onClick={() => setShowNewChat(true)} aria-label="Nouveau message"><Plus size={19} /></button></div>
              <div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une discussion..." /><kbd>⌘ K</kbd></div>
              <div className="filter-row"><span>RÉCENTES <b>{chats.length}</b></span><button onClick={() => setSearch('')}>Tout voir <ArrowUpRight size={13} /></button></div>
              <div className="chat-list">
                {filteredChats.map((chat) => <button key={chat.id} className={`chat-row ${activeChat === chat.id ? 'chat-selected' : ''}`} onClick={() => { setActiveChat(chat.id); setShowChatOnMobile(true); }}>
                  <Avatar label={chat.avatar} color={chat.color} online={chat.online} />
                  <span className="chat-row-copy"><strong>{chat.name}</strong><small>{chat.last}</small></span>
                  <span className="chat-meta"><small>{chat.time}</small>{chat.unread > 0 && <b>{chat.unread}</b>}</span>
                </button>)}
                {filteredChats.length === 0 && <div className="empty-search">{loadingChats ? 'Chargement des discussions…' : account ? 'Aucune discussion pour le moment.' : 'Aucune discussion trouvée.'}</div>}
              </div>
              <div className="online-block"><div className="online-heading">JOUEURS EN LIGNE <span>12</span></div><div className="online-avatars"><Avatar label="K" color="cyan" online /><Avatar label="M" color="violet" online /><Avatar label="A" color="pink" online /><Avatar label="+" color="dark" /><span>Voir les joueurs</span></div></div>
            </section>

            <section className="chat-panel">
              {currentChat ? <>
                <div className="chat-header"><button className="icon-button mobile-back" onClick={() => setShowChatOnMobile(false)} aria-label="Retour aux discussions"><ArrowLeft size={19} /></button><div className="chat-person"><Avatar label={currentChat.avatar} color={currentChat.color} online={currentChat.online} /><div><strong>{currentChat.name}</strong><span>{currentChat.online ? 'En ligne maintenant' : currentChat.tag}</span></div></div><div className="chat-tools"><button className="icon-button" onClick={() => notify('Les appels seront ajoutés après validation technique.')} aria-label="Appel audio"><Phone size={18} /></button><button className="icon-button" onClick={() => notify('Les appels vidéo seront ajoutés après validation technique.')} aria-label="Appel vidéo"><Video size={18} /></button><button className="icon-button" onClick={() => notify('Options de discussion à venir.')} aria-label="Plus d’options"><MoreHorizontal size={20} /></button></div></div>
                <div className="chat-context"><span className="context-lock"><ShieldCheck size={14} /></span><span>Bienvenue dans ton espace de discussion. Respect et fair-play avant tout.</span></div>
                <div className="messages-area"><div className="date-divider"><span>AUJOURD’HUI</span></div>
                  {currentMessages.map((message) => <div key={message.id} className={`message-line ${message.mine ? 'message-mine' : ''}`}>
                    {!message.mine && <Avatar label={currentChat.avatar} color={currentChat.color} />}
                    <div className="message-content">{!message.mine && <strong>{message.from}</strong>}<div className="bubble">{message.text}</div><small>{message.time} {message.mine && <CheckCheck size={13} />}</small></div>
                  </div>)}
                </div>
                <form className="composer" onSubmit={sendMessage}><div className="composer-tools"><button type="button" onClick={() => notify('Les pièces jointes arrivent dans une prochaine version.')} aria-label="Ajouter une pièce jointe"><Paperclip size={18} /></button><button type="button" onClick={() => notify('Les emojis arrivent bientôt.')} aria-label="Ajouter un emoji"><Smile size={18} /></button></div><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Écris ton message..." aria-label="Ton message" /><button className="send-button" type="submit" disabled={!draft.trim()} aria-label="Envoyer le message"><Send size={18} /></button></form>
                <div className="composer-foot"><span>Sois cool. Joue fair-play.</span><span>FREE CHAT <b>✦</b></span></div>
              </> : <div className="empty-chat">Sélectionne une discussion pour commencer.</div>}
            </section>
          </div>
        )}

        {showNewChat && <div className="modal-backdrop" onClick={() => setShowNewChat(false)}><form className="modal-card" onSubmit={startDirectConversation} onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowNewChat(false)}><X size={18} /></button><div className="eyebrow">NOUVELLE DISCUSSION</div><h2>Écrire à un joueur</h2><p>Recherche son pseudo FREE CHAT exact pour démarrer une conversation privée.</p><input autoFocus value={newPlayerUsername} onChange={(event) => setNewPlayerUsername(event.target.value)} placeholder="Pseudo du joueur" maxLength={24} /><button className="primary-button" type="submit" disabled={!newPlayerUsername.trim()}>Démarrer la discussion <ArrowUpRight size={16} /></button></form></div>}
        {section === 'guildes' && <section className="content-page"><div className="page-hero"><div><div className="eyebrow">JOUE ENSEMBLE</div><h1>Les guildes<span className="title-dot">.</span></h1><p>Rassemble ton escouade, partage tes stratégies et construis ta communauté.</p></div><button className="primary-button" onClick={() => setShowNewGuild(true)}><Plus size={17} /> Créer une guilde</button></div><div className="guild-grid">{localGuilds.map((guild) => <article className="guild-card" key={guild.id || guild.name}><div className={`guild-emblem symbol-${guild.color}`}>{guild.icon}</div><div className="guild-card-info"><span className="eyebrow">GUILDE GAMER</span><h2>{guild.name}</h2><p><Users size={14} /> {guild.members}</p>{guild.description && <p>{guild.description}</p>}</div><div className="guild-card-footer"><span><i /> {guild.status}</span>{account && guild.id && !guild.joined && !guild.owner ? <button onClick={() => joinGuild(guild)} aria-label={`Rejoindre ${guild.name}`}><UserPlus size={17} /></button> : <button onClick={() => notify(guild.owner ? 'Tu es chef de cette guilde.' : guild.joined ? 'Tu es membre de cette guilde.' : 'Les détails de cette guilde arrivent bientôt.')} aria-label={`Voir ${guild.name}`}><ArrowUpRight size={17} /></button>}</div></article>)}{loadingGuilds && <p>Chargement des guildes…</p>}{!loadingGuilds && account && localGuilds.length === 0 && <p>Aucune guilde publique pour le moment. Crée la première.</p>}</div>{showNewGuild && <div className="modal-backdrop" onClick={() => setShowNewGuild(false)}><form className="modal-card" onSubmit={createGuild} onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowNewGuild(false)}><X size={18} /></button><div className="eyebrow">NOUVELLE COMMUNAUTÉ</div><h2>Créer une guilde</h2><p>Donne un nom à ton escouade. Tu pourras personnaliser ses détails ensuite.</p><input autoFocus value={guildName} onChange={(event) => setGuildName(event.target.value)} placeholder="Ex. NIGHT WOLVES" maxLength={32} /><textarea value={guildDescription} onChange={(event) => setGuildDescription(event.target.value)} placeholder="Description de ta guilde (facultatif)" maxLength={500} /><button className="primary-button" type="submit" disabled={guildName.trim().length < 3}>Créer la guilde <ArrowUpRight size={16} /></button></form></div>}</section>}

        {section === 'decouvrir' && <section className="content-page"><div className="page-hero"><div><div className="eyebrow">LE FEED DES JOUEURS</div><h1>Découvrir<span className="title-dot">.</span></h1><p>Les idées, les annonces et les moments de la communauté.</p></div><button className="primary-button" onClick={() => account ? setShowNewPost(true) : notify('Connecte-toi pour publier dans la communauté.')}><Plus size={17} /> Publier</button></div><div className="feed-layout"><div className="feed-list">{communityPosts.map((post) => <article className="post-card" key={post.id || post.author}><div className="post-head"><Avatar label={post.avatar} color={post.color} /><div><strong>{post.author}</strong><small>{post.time}</small></div><span className="post-tag">{post.label}</span></div><p>{post.text}</p><div className="post-actions"><button className={reactionsByPost[post.id]?.mine ? 'liked' : ''} onClick={() => toggleReaction(post.id)} disabled={reactionBusy === post.id}>🔥 {reactionsByPost[post.id]?.count || 0} Réaction{(reactionsByPost[post.id]?.count || 0) > 1 ? 's' : ''}</button><button onClick={() => toggleComments(post.id)}>{commentsByPost[post.id]?.length || 0} commentaire{(commentsByPost[post.id]?.length || 0) > 1 ? 's' : ''}</button><button onClick={() => notify('Le partage sera bientôt disponible.')}>Partager</button></div>{expandedComments.includes(post.id) && <div className="comments-panel">{(commentsByPost[post.id] || []).map((comment) => <div className="comment-row" key={comment.id}><Avatar label={comment.avatar} color="violet" /><div className="comment-copy"><strong>{comment.author}</strong><small>{comment.time}</small><p>{comment.body}</p></div></div>)}{account ? <form className="comment-composer" onSubmit={(event) => submitComment(event, post.id)}><input value={commentDrafts[post.id] || ''} onChange={(event) => setCommentDrafts((previous) => ({ ...previous, [post.id]: event.target.value }))} placeholder="Écrire un commentaire…" maxLength={1000} aria-label="Ton commentaire" /><button type="submit" disabled={!(commentDrafts[post.id] || '').trim() || sendingComment === post.id}>{sendingComment === post.id ? 'Envoi…' : <Send size={15} />}</button></form> : <p className="comments-signin">Connecte-toi pour participer à la discussion.</p>}</div>}</article>)}</div><aside className="community-aside"><div className="aside-card"><div className="aside-icon"><Zap size={19} /></div><span className="eyebrow">À LA UNE</span><h3>La communauté prend vie.</h3><p>Retrouve les joueurs, découvre les guildes et prépare ta prochaine escouade.</p></div><div className="aside-card mini-aside"><span className="eyebrow">ESPRIT GAMER</span><h3>Respect. Stratégie. Fair-play.</h3><p>Une bonne communauté commence par de bonnes attitudes.</p></div></aside></div>{loadingPosts && <p>Chargement des publications…</p>}{!loadingPosts && account && communityPosts.length === 0 && <p>Aucune publication pour le moment. Lance la conversation !</p>}</div>{showNewPost && <div className="modal-backdrop" onClick={() => setShowNewPost(false)}><form className="modal-card" onSubmit={createPost} onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowNewPost(false)}><X size={18} /></button><div className="eyebrow">PRENDRE LA PAROLE</div><h2>Nouvelle publication</h2><p>Partage une idée, une annonce ou un moment avec les joueurs.</p><textarea autoFocus value={postDraft} onChange={(event) => setPostDraft(event.target.value)} placeholder="Quoi de neuf dans ta communauté ?" maxLength={3000} /><small>{postDraft.length}/3000</small><button className="primary-button" type="submit" disabled={!postDraft.trim()}>Publier <ArrowUpRight size={16} /></button></form></div>}</section>}

        {section === 'admin' && canModerate && <section className="content-page admin-page">
          <div className="page-hero"><div><div className="eyebrow">ESPACE PRIVILÉGIÉ · {userRole?.toUpperCase()}</div><h1>Administration<span className="title-dot">.</span></h1><p>Suivi de la communauté, contrôle des signalements et outils de modération.</p></div><button className="secondary-button" onClick={loadAdminDashboard}><ArrowUpRight size={14} /> Actualiser</button></div>
          <div className="admin-stat-grid">
            <article className="admin-stat"><span>JOUEURS</span><strong>{adminStats.players}</strong></article>
            <article className="admin-stat"><span>PUBLICATIONS</span><strong>{adminStats.posts}</strong></article>
            <article className="admin-stat"><span>GUILDES</span><strong>{adminStats.guilds}</strong></article>
            <article className="admin-stat"><span>À TRAITER</span><strong>{adminStats.openReports}</strong></article>
          </div>
          <div className="admin-section-heading"><div><div className="eyebrow">MODÉRATION</div><h2>Signalements récents</h2></div><span>{adminReports.length} affichés</span></div>
          {loadingAdmin ? <p>Chargement du tableau de bord…</p> : adminReports.length === 0 ? <div className="admin-empty"><ShieldCheck size={24} /><strong>Aucun signalement.</strong><span>Les nouveaux signalements apparaîtront ici.</span></div> : <div className="admin-report-list">{adminReports.map((report) => <article className="admin-report" key={report.id}>
            <div className="admin-report-top"><strong>{report.target_type.toUpperCase()}</strong><span className={'report-status status-' + report.status}>{report.status}</span></div>
            <p>{report.reason}</p><small>Signalé par {report.reporter} · {new Date(report.created_at).toLocaleString('fr-FR')}</small>
            <div className="admin-report-actions">
              {report.status !== 'reviewing' && <button onClick={() => updateReportStatus(report.id, 'reviewing')}>Examiner</button>}
              {report.status !== 'resolved' && <button onClick={() => updateReportStatus(report.id, 'resolved')}>Résoudre</button>}
              {report.status !== 'dismissed' && <button onClick={() => updateReportStatus(report.id, 'dismissed')}>Classer sans suite</button>}
            </div>
          </article>)}</div>}
          <div className="admin-security-note"><ShieldCheck size={16} /><span>Accès contrôlé par le rôle sécurisé <code>app_metadata.role</code>. Les rôles ne sont jamais lus depuis les métadonnées modifiables du profil.</span></div>
        </section>}

        {section === 'profil' && <section className="content-page"><div className="eyebrow">IDENTITÉ GAMER</div><h1>Mon profil<span className="title-dot">.</span></h1><div className="profile-card"><div className="profile-cover"><div className="cover-glow" /></div><div className="profile-details"><Avatar label="F" color="cyan" large /><div className="profile-data"><h2>{gamerName} <span className="verified-mark"><ShieldCheck size={15} /></span></h2><p>{gamerTag} · Joueur FREE CHAT</p><span className="profile-level"><Crown size={14} /> Niveau 1 · Nouveau joueur</span></div><button className="secondary-button" onClick={() => notify('La modification du profil sera bientôt disponible.')}>Modifier le profil</button></div><div className="profile-stats"><div><strong>01</strong><span>GUILDE</span></div><div><strong>04</strong><span>DISCUSSIONS</span></div><div><strong>01</strong><span>NIVEAU</span></div></div><div className="profile-note"><Sparkles size={17} /><span>Ton identité gamer évoluera au fil de tes aventures sur FREE CHAT.</span></div></div><div className="disclaimer"><ShieldCheck size={17} /><span>FREE CHAT est un projet indépendant. Les identifiants et statistiques de compte Free Fire ne sont pas vérifiés par Garena.</span></div></section>}
        <footer className="app-footer"><span>FREE CHAT <b>✦</b> FREE CHAT STUDIO</span><span>Une communauté. Une escouade. Ton univers.</span></footer>
      </main>
      {notice && <div className="toast"><Sparkles size={16} />{notice}</div>}
      {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Fermer le menu" />}
      <div className="demo-indicator"><span /> {account ? "MESSAGERIE CONNECTÉE · autres espaces en aperçu" : "MODE APERÇU · données locales non synchronisées"}</div>
    </div>
  );
}

function App() {
  return isSupabaseConfigured ? <AuthGate><Workspace /></AuthGate> : <Workspace />;
}

export default App;