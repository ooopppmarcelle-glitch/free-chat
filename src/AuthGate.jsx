import { useEffect, useState } from 'react';
import { ArrowRight, Gamepad2, Mail, Lock, User, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabase.js';
import './auth.css';

export default function AuthGate({ children }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function ensureProfile(user) {
    if (!user) return;
    const safeUsername = (user.user_metadata?.username || `player_${user.id.slice(0, 8)}`).toLowerCase();
    const safeDisplayName = user.user_metadata?.display_name || safeUsername;
    const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: user.id,
      username: safeUsername,
      display_name: safeDisplayName
    }, { onConflict: 'user_id', ignoreDuplicates: true });
    if (profileError) {
      setNotice('Compte connecté. La création du profil gamer reste à terminer : ' + profileError.message);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return;
    if (mode === 'register') {
      const cleanUsername = username.trim().toLowerCase();
      const cleanDisplayName = displayName.trim();
      if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
        setError('Le pseudo doit contenir 3 à 24 caractères : lettres, chiffres ou _.');
        return;
      }
      if (cleanDisplayName.length < 2 || cleanDisplayName.length > 40) {
        setError('Le nom affiché doit contenir entre 2 et 40 caractères.');
        return;
      }
      if (password.length < 8) {
        setError('Choisis un mot de passe de 8 caractères minimum.');
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { username: username.trim().toLowerCase(), display_name: displayName.trim() } }
        });
        if (signUpError) throw signUpError;
        if (data.session && data.user) {
          setSession(data.session);
          await ensureProfile(data.user);
        } else {
          setNotice('Compte créé. Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter.');
          setMode('login');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (signInError) throw signInError;
        setSession(data.session);
        await ensureProfile(data.user);
      }
    } catch (authError) {
      setError(authError.message || 'Une erreur est survenue. Réessaie.');
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <div className="auth-loading"><span className="auth-spinner" /> Préparation de FREE CHAT…</div>;
  }
  if (session) return <>{children}</>;

  return (
    <main className="auth-screen">
      <div className="auth-glow auth-glow-a" /><div className="auth-glow auth-glow-b" />
      <section className="auth-card">
        <div className="auth-brand"><span><Gamepad2 size={24} /></span><div><strong>FREE<span>CHAT</span></strong><small>ENTRE NOUS, LES GAMERS</small></div></div>
        <div className="auth-eyebrow"><Sparkles size={14} /> TON UNIVERS GAMER COMMENCE ICI</div>
        <h1>{mode === 'login' ? 'Content de te revoir.' : 'Rejoins la communauté.'}</h1>
        <p className="auth-intro">{mode === 'login' ? 'Connecte-toi pour retrouver ton espace gamer.' : 'Crée ton compte FREE CHAT avec une adresse mail vérifiable.'}</p>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Connexion</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Inscription</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && <>
            <label><span>Pseudo gamer</span><div className="auth-input"><User size={17} /><input value={username} onChange={e => setUsername(e.target.value)} placeholder="ex. farel_237" autoComplete="username" maxLength={24} required /></div></label>
            <label><span>Nom affiché</span><div className="auth-input"><User size={17} /><input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ton nom dans FREE CHAT" maxLength={40} required /></div></label>
          </>}
          <label><span>Adresse e-mail</span><div className="auth-input"><Mail size={17} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="joueur@exemple.com" autoComplete="email" required /></div></label>
          <label><span>Mot de passe</span><div className="auth-input"><Lock size={17} /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8 caractères minimum" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></div></label>
          {error && <div className="auth-message auth-error" role="alert">{error}</div>}
          {notice && <div className="auth-message auth-notice" role="status">{notice}</div>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Patiente…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'} <ArrowRight size={17} /></button>
        </form>
        <div className="auth-security"><ShieldCheck size={16} /><span>Ton adresse mail doit être confirmée. Ne partage jamais ton mot de passe.</span></div>
        <footer>FREE CHAT STUDIO <b>✦</b> Créé par Farel</footer>
      </section>
    </main>
  );
}
