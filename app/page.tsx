"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";

type Profile = { id:string; full_name:string|null; username:string|null; country:string|null; bio:string|null; avatar_url:string|null };
type Post = { id:number; content:string; created_at:string; author_id:string; profiles?: Profile|null };
type Project = { id:number; name:string; description:string|null; category:string|null; tech_stack:string[]|null; url:string|null; owner_id:string; profiles?: Profile|null };

const demoPeople = [
  { initials:"AM", name:"Amina M.", role:"Full-stack developer", place:"Kinshasa 🇨🇩", tags:["Next.js","Supabase"] },
  { initials:"DK", name:"David K.", role:"AI Engineer", place:"Nairobi 🇰🇪", tags:["Python","AI"] },
  { initials:"LS", name:"Lucas S.", role:"Mobile developer", place:"Paris 🇫🇷", tags:["React Native","TypeScript"] },
];

export default function Home() {
  const [active,setActive]=useState("Accueil");
  const [user,setUser]=useState<any>(null);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [posts,setPosts]=useState<Post[]>([]);
  const [projects,setProjects]=useState<Project[]>([]);
  const [query,setQuery]=useState("");
  const [authOpen,setAuthOpen]=useState(false);
  const [mode,setMode]=useState<"login"|"signup">("signup");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [postText,setPostText]=useState("");
  const [projectName,setProjectName]=useState("");
  const [projectDescription,setProjectDescription]=useState("");
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");
  const [settings,setSettings]=useState({notifications:true,publicProfile:true,language:"Français",theme:"Clair"});
  const [settingsSaved,setSettingsSaved]=useState(false);

  async function loadData(currentUser:any) {
    try {
      const { data: ps, error: postsError } = await supabase
        .from("community_posts")
        .select("id,content,created_at,author_id")
        .order("created_at",{ascending:false})
        .limit(30);
      if (!postsError) setPosts((ps||[]) as Post[]);

      const { data: prs, error: projectsError } = await supabase
        .from("projects")
        .select("id,name,description,category,tech_stack,url,owner_id")
        .order("created_at",{ascending:false})
        .limit(30);
      if (!projectsError) setProjects((prs||[]) as Project[]);

      if (currentUser) {
        const { data:p } = await supabase.from("profiles").select("*").eq("id",currentUser.id).maybeSingle();
        setProfile(p as Profile|null);
      }
    } catch (err) {
      console.error("loadData", err);
    }
  }

  useEffect(() => {
    try { const saved=localStorage.getItem("oneworld-settings"); if(saved) setSettings(prev=>({...prev,...JSON.parse(saved)})); } catch {}
  },[]);
  
  useEffect(() => {
    document.documentElement.dataset.theme=settings.theme==="Sombre"?"dark":"light";
    try { localStorage.setItem("oneworld-settings",JSON.stringify(settings)); } catch {}
  },[settings]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({data}) => {
      if (!mounted) return;
      const currentUser=data.session?.user||null;
      setUser(currentUser);
      void loadData(currentUser);
    });
    const {data:listener}=supabase.auth.onAuthStateChange((_event,session)=>{
      const currentUser=session?.user||null;
      setUser(currentUser);
      void loadData(currentUser);
    });
    return ()=>{ mounted=false; listener.subscription.unsubscribe(); };
  },[]);

  const filteredPeople = useMemo(()=>demoPeople.filter(p=>(p.name+" "+p.role+" "+p.place+" "+p.tags.join(" ")).toLowerCase().includes(query.toLowerCase())),[query]);
  const filteredProjects = useMemo(()=>projects.filter(p=>(p.name+" "+(p.description||"")+" "+(p.category||"")+" "+(p.tech_stack||[]).join(" ")).toLowerCase().includes(query.toLowerCase())),[projects,query]);

  async function auth(e:FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if(mode==="signup") {
        const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()}}});
        if(error) throw error;
        if(!data.user) throw new Error("Impossible de créer le compte.");
        const username=name.trim().toLowerCase().replace(/[^a-z0-9]+/g,"").slice(0,20)||null;
        if(data.session){
          const {error:profileError}=await supabase.from("profiles").upsert({id:data.user.id,full_name:name.trim(),username});
          if(profileError) throw profileError;
          setMessage("Compte créé.");
          setAuthOpen(false);
        } else {
          setMessage("Compte créé. Vérifie ton e-mail, puis connecte-toi pour terminer ton profil.");
          setAuthOpen(false);
        }
      } else {
        const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
        if(error) throw error;
        if(data.user){
          const fullName=(data.user.user_metadata?.full_name as string|undefined)?.trim()||name.trim()||null;
          const username=fullName?.toLowerCase().replace(/[^a-z0-9]+/g,"").slice(0,20)||null;
          const {error:profileError}=await supabase.from("profiles").upsert({id:data.user.id,full_name:fullName,username},{onConflict:"id"});
          if(profileError) throw profileError;
        }
        setAuthOpen(false);
        setMessage("Connexion réussie.");
      }
    } catch (err) {
      const error = err as { message?: string };
      setMessage(error?.message || "Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function logout(){ await supabase.auth.signOut(); setUser(null); setProfile(null); setMessage("Déconnexion réussie."); }

  async function publishPost(e:FormEvent){
    e.preventDefault(); if(!user || !postText.trim()) return;
    const {error}=await supabase.from("community_posts").insert({author_id:user.id,content:postText.trim()});
    if(error) setMessage(error.message); else { setPostText(""); setMessage("Publication créée."); await loadData(user); }
  }

  async function createProject(e:FormEvent){
    e.preventDefault(); if(!user || !projectName.trim()) return;
    const {error}=await supabase.from("projects").insert({owner_id:user.id,name:projectName.trim(),description:projectDescription.trim()||null,category:"Numérique",tech_stack:["Next.js","Supabase"]});
    if(error) setMessage(error.message); else { setProjectName(""); setProjectDescription(""); setMessage("Projet créé."); await loadData(user); }
  }

  return <main>
    <nav className="nav">
      <button className="brand" onClick={()=>setActive("Accueil")}><span className="brand-mark">◎</span> ONE<span>WORLD</span></button>
      <div className="nav-links">{["Accueil","Communauté","Projets","Découvrir","Paramètres"].map(item=><button key={item} className={active===item?"nav-active":""} onClick={()=>setActive(item)}>{item}</button>)}</div>
      <button className="mobile-settings" onClick={()=>setActive("Paramètres")}>⚙️ Paramètres</button><div className="nav-actions">
        {user ? <><button className="login" onClick={()=>setActive("Profil")}>{profile?.full_name||"Mon profil"}</button><button className="primary small" onClick={logout}>Se déconnecter</button></> :
        <><button className="login" onClick={()=>{setMode("login");setAuthOpen(true)}}>Se connecter</button><button className="primary small" onClick={()=>{setMode("signup");setAuthOpen(true)}}>Créer un compte</button></>}
      </div>
    </nav>

    {message && <div className="toast">{message}<button onClick={()=>setMessage("")}>×</button></div>}

    {active==="Accueil" && <><section className="hero">
      <div className="glow glow-one"/><div className="glow glow-two"/>
      <div className="hero-copy"><div className="pill">✦ Le réseau numérique sans frontières</div>
        <h1>Le monde numérique<br/><em>commence avec toi.</em></h1>
        <p>Une plateforme réelle pour rencontrer des talents, publier, créer des projets et collaborer — depuis la RDC jusqu’au monde entier.</p>
        <div className="hero-actions"><button className="primary" onClick={()=>{setMode("signup");setAuthOpen(true)}}>Rejoindre la communauté <span>→</span></button><button className="secondary" onClick={()=>setActive("Découvrir")}>Explorer le réseau</button></div>
        <div className="trust"><span className="avatars"><i>AM</i><i>DK</i><i>LS</i><i>+</i></span><span><b>Comptes et données réels</b><br/>alimentés par Supabase</span></div>
      </div>
      <div className="hero-card"><div className="card-top"><span>COMMUNAUTÉ MONDIALE</span><b>● EN LIGNE</b></div><div className="network"><div className="orbit o1"/><div className="orbit o2"/><div className="node center">◎</div><div className="node n1">🇨🇩</div><div className="node n2">🇰🇪</div><div className="node n3">🇫🇷</div><div className="node n4">🇿🇦</div><div className="node n5">🇺🇸</div></div><div className="card-bottom"><strong>{posts.length}+</strong><span>publications</span><strong>{projects.length}</strong><span>projets</span></div></div>
    </section>
    <section className="section"><div className="section-head"><div><span className="eyebrow">FONCTIONNALITÉS RÉELLES</span><h2>Construire, publier,<br/><em>collaborer.</em></h2></div><p>Inscription, profils, publications et projets sont maintenant reliés à la base de données.</p></div>
      <div className="feature-grid">{[
        ["👤","Comptes","Inscription et connexion sécurisées."],["📝","Publications","Publie des messages visibles par la communauté."],["🚀","Projets","Crée et présente tes projets."],["🔎","Découverte","Recherche dans les profils et projets."]
      ].map(([icon,title,text])=><article className="feature" key={title}><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><button onClick={()=>setActive(title==="Publications"?"Communauté":title==="Projets"?"Projets":"Découvrir")}>Ouvrir →</button></article>)}</div>
    </section></>}

    {active==="Communauté" && <section className="app-section"><div className="section-head"><div><span className="eyebrow">COMMUNAUTÉ</span><h2>Le fil <em>ONEWORLD.</em></h2></div><input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher…"/></div>
      {!user ? <div className="auth-banner"><h3>Connecte-toi pour publier et suivre les membres.</h3><button className="primary" onClick={()=>{setMode("login");setAuthOpen(true)}}>Se connecter</button></div> :
      <form className="composer" onSubmit={publishPost}><textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="Que veux-tu partager avec la communauté ?"/><button className="primary" disabled={!postText.trim()}>Publier</button></form>}
      <div className="feed">{posts.filter(p=>p.content.toLowerCase().includes(query.toLowerCase())).map(p=><article className="post" key={p.id}><div className="person-avatar">{(p.profiles?.full_name||p.profiles?.username||"U").slice(0,2).toUpperCase()}</div><div><strong>{p.profiles?.full_name||p.profiles?.username||"Membre ONEWORLD"}</strong><small>{p.profiles?.country||"Membre"} · {new Date(p.created_at).toLocaleString("fr-FR")}</small><p>{p.content}</p></div></article>)}{posts.length===0&&<div className="empty">Aucune publication pour le moment. Sois le premier à publier.</div>}</div>
    </section>}

    {active==="Projets" && <section className="app-section"><div className="section-head"><div><span className="eyebrow">PROJETS</span><h2>Les idées qui <em>deviennent réelles.</em></h2></div></div>
      {user && <form className="project-form" onSubmit={createProject}><input value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="Nom du projet" required/><textarea value={projectDescription} onChange={e=>setProjectDescription(e.target.value)} placeholder="Décris ton projet…"/><button className="primary">Créer le projet</button></form>}
      {!user && <div className="auth-banner"><h3>Connecte-toi pour créer un projet.</h3><button className="primary" onClick={()=>{setMode("login");setAuthOpen(true)}}>Se connecter</button></div>}
      <div className="project-grid">{filteredProjects.map(p=><article className="project" key={p.id}><span className="tag">{p.category||"Projet"}</span><h3>{p.name}</h3><p>{p.description||"Projet de la communauté ONEWORLD."}</p><small>par {p.profiles?.full_name||p.profiles?.username||"membre"} · {(p.tech_stack||[]).join(" · ")}</small>{p.url&&<a href={p.url} target="_blank" rel="noreferrer">Voir le projet →</a>}</article>)}{projects.length===0&&<div className="empty">Aucun projet. Crée le premier.</div>}</div>
    </section>}

    {active==="Découvrir" && <section className="app-section"><div className="section-head"><div><span className="eyebrow">DÉCOUVRIR</span><h2>Des talents à <em>rencontrer.</em></h2></div><input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nom, compétence, pays…"/></div><div className="people">{filteredPeople.map(p=><article className="person" key={p.name}><div className="person-avatar">{p.initials}</div><div className="person-main"><h3>{p.name}</h3><p>{p.role}</p><small>{p.place}</small><div>{p.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div></div><button className="connect" onClick={()=>{if(!user){setMode("login");setAuthOpen(true)}else setMessage("Profil public : connexion sociale à venir.")}}>+</button></article>)}</div></section>}

    {active==="Profil" && <section className="app-section"><div className="profile-card"><span className="eyebrow">MON PROFIL</span><h2>{profile?.full_name||user?.email}</h2><p>{profile?.bio||"Ajoute bientôt ta bio, ton pays et tes compétences depuis ton profil."}</p><div className="profile-grid"><div><b>Nom d'utilisateur</b><span>{profile?.username||"—"}</span></div><div><b>Pays</b><span>{profile?.country||"—"}</span></div><div><b>E-mail</b><span>{user?.email||"—"}</span></div></div></div></section>}\n\n    {active==="Paramètres" && <section className="app-section"><div className="section-head"><div><span className="eyebrow">CONFIGURATION</span><h2>Les <em>paramètres.</em></h2></div><p>Personnalise ton expérience ONEWORLD. Les préférences sont conservées sur cet appareil.</p></div>
      <div className="settings-grid">
        <article className="settings-card"><div><span className="settings-icon">🔔</span><div><h3>Notifications</h3><p>Recevoir les alertes et mises à jour de la plateforme.</p></div></div><button className={settings.notifications?"toggle on":"toggle"} onClick={()=>setSettings(s=>({...s,notifications:!s.notifications}))}><span/></button></article>
        <article className="settings-card"><div><span className="settings-icon">🌍</span><div><h3>Langue</h3><p>Choisis la langue principale de l'interface.</p></div></div><select value={settings.language} onChange={e=>setSettings(s=>({...s,language:e.target.value}))}><option>Français</option><option>English</option></select></article>
        <article className="settings-card"><div><span className="settings-icon">🎨</span><div><h3>Apparence</h3><p>Choisis le thème de l'application.</p></div></div><select value={settings.theme} onChange={e=>setSettings(s=>({...s,theme:e.target.value}))}><option>Clair</option><option>Sombre</option></select></article>
        <article className="settings-card"><div><span className="settings-icon">👁️</span><div><h3>Profil public</h3><p>Autoriser les autres membres à découvrir ton profil.</p></div></div><button className={settings.publicProfile?"toggle on":"toggle"} onClick={()=>setSettings(s=>({...s,publicProfile:!s.publicProfile}))}><span/></button></article>
      </div>
      <div className="settings-actions"><button className="primary" onClick={()=>{localStorage.setItem("oneworld-settings",JSON.stringify(settings));setSettingsSaved(true);setMessage("Paramètres enregistrés.");setTimeout(()=>setSettingsSaved(false),1800)}}>{settingsSaved?"Enregistré ✓":"Enregistrer les paramètres"}</button>{user&&<button className="secondary" onClick={logout}>Se déconnecter</button>}</div>
    </section>}

    <footer><div className="brand"><span className="brand-mark">◎</span> ONE<span>WORLD</span></div><p>Le monde numérique, connecté.</p><small>© 2026 ONEWORLD.</small></footer>

    {authOpen && <div className="modal-backdrop" onClick={()=>setAuthOpen(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setAuthOpen(false)}>×</button><span className="eyebrow">{mode==="signup"?"NOUVEAU COMPTE":"CONNEXION"}</span><h2>{mode==="signup"?"Rejoins ONEWORLD.":"Bon retour."}</h2><form onSubmit={auth}>{mode==="signup"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom complet" required/>}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" required/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe (6 caractères min.)" minLength={6} required/><button className="primary" disabled={loading}>{loading?"Chargement…":mode==="signup"?"Créer mon compte":"Se connecter"}</button></form><button className="switch" onClick={()=>setMode(mode==="signup"?"login":"signup")}>{mode==="signup"?"J'ai déjà un compte":"Créer un compte"}</button></div></div>}
  </main>;
}
