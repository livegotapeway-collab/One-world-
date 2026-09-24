"use client";

import { useState } from "react";

const features = [
  { icon: "🌍", title: "Réseau mondial", text: "Découvre des développeurs, créateurs et projets partout dans le monde." },
  { icon: "🤝", title: "Collaboration", text: "Trouve des partenaires pour construire des produits numériques ensemble." },
  { icon: "🚀", title: "Projets", text: "Présente tes projets et transforme tes idées en réalisations visibles." },
  { icon: "🤖", title: "IA & innovation", text: "Explore les outils d’intelligence artificielle et les nouvelles technologies." },
];

const people = [
  { initials: "AM", name: "Amina M.", role: "Full-stack developer", place: "Kinshasa 🇨🇩", tags: ["Next.js", "Supabase"] },
  { initials: "DK", name: "David K.", role: "AI Engineer", place: "Nairobi 🇰🇪", tags: ["Python", "AI"] },
  { initials: "LS", name: "Lucas S.", role: "Mobile developer", place: "Paris 🇫🇷", tags: ["React Native", "TypeScript"] },
];

export default function Home() {
  const [active, setActive] = useState("Accueil");

  return (
    <main>
      <nav className="nav">
        <div className="brand"><span className="brand-mark">◎</span> ONE<span>WORLD</span></div>
        <div className="nav-links">
          {["Accueil", "Communauté", "Projets", "Découvrir"].map((item) => (
            <button key={item} className={active === item ? "nav-active" : ""} onClick={() => setActive(item)}>{item}</button>
          ))}
        </div>
        <div className="nav-actions"><button className="login">Se connecter</button><button className="primary small">Créer un compte</button></div>
      </nav>

      <section className="hero">
        <div className="glow glow-one" /><div className="glow glow-two" />
        <div className="hero-copy">
          <div className="pill">✦ Le réseau numérique sans frontières</div>
          <h1>Le monde numérique<br /><em>commence avec toi.</em></h1>
          <p>Une plateforme pour rencontrer des talents, apprendre, collaborer et construire les technologies de demain — depuis la RDC jusqu’au monde entier.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => setActive("Communauté")}>Rejoindre la communauté <span>→</span></button>
            <button className="secondary" onClick={() => setActive("Découvrir")}>Explorer le réseau</button>
          </div>
          <div className="trust"><span className="avatars"><i>AM</i><i>DK</i><i>LS</i><i>+</i></span><span><b>Une communauté ouverte</b><br />pour les bâtisseurs du numérique</span></div>
        </div>
        <div className="hero-card">
          <div className="card-top"><span>COMMUNAUTÉ MONDIALE</span><b>● EN LIGNE</b></div>
          <div className="network">
            <div className="orbit o1"/><div className="orbit o2"/><div className="node center">◎</div>
            <div className="node n1">🇨🇩</div><div className="node n2">🇰🇪</div><div className="node n3">🇫🇷</div><div className="node n4">🇿🇦</div><div className="node n5">🇺🇸</div>
          </div>
          <div className="card-bottom"><strong>12,480+</strong><span>membres connectés</span><strong>86</strong><span>pays</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><div><span className="eyebrow">UN SEUL ESPACE</span><h2>Tout ce qu’il faut pour <em>avancer.</em></h2></div><p>ONEWORLD réunit les personnes, les idées et les outils qui font progresser le numérique.</p></div>
        <div className="feature-grid">{features.map((f) => <article className="feature" key={f.title}><div className="feature-icon">{f.icon}</div><h3>{f.title}</h3><p>{f.text}</p><button onClick={() => setActive("Découvrir")}>En savoir plus →</button></article>)}</div>
      </section>

      <section className="community">
        <div className="section-head"><div><span className="eyebrow">RÉSEAU</span><h2>Des talents à <em>rencontrer.</em></h2></div><button className="secondary" onClick={() => setActive("Communauté")}>Voir toute la communauté →</button></div>
        <div className="people">{people.map((p) => <article className="person" key={p.name}><div className="person-avatar">{p.initials}</div><div className="person-main"><h3>{p.name}</h3><p>{p.role}</p><small>{p.place}</small><div>{p.tags.map(t => <span className="tag" key={t}>{t}</span>)}</div></div><button className="connect" onClick={() => alert("La connexion sera disponible avec le compte utilisateur.")}>+</button></article>)}</div>
      </section>

      <section className="cta"><div><span className="eyebrow">CONSTRUISONS ENSEMBLE</span><h2>Ton prochain projet peut<br /><em>commencer ici.</em></h2></div><button className="primary" onClick={() => setActive("Projets")}>Commencer gratuitement →</button></section>

      <footer><div className="brand"><span className="brand-mark">◎</span> ONE<span>WORLD</span></div><p>Le monde numérique, connecté.</p><small>© 2026 ONEWORLD. Une plateforme ouverte aux talents du monde entier.</small></footer>
    </main>
  );
}
