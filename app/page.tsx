"use client";

import { useMemo, useState } from "react";

type Offer={id:number;title:string;description:string;price:number;owner:string};

const initialOffers:Offer[]=[
 {id:1,title:"Création de logo",description:"Logo professionnel pour petite entreprise.",price:25,owner:"Amina"},
 {id:2,title:"Montage vidéo TikTok",description:"Vidéo courte avec montage et sous-titres.",price:15,owner:"David"},
 {id:3,title:"Site vitrine",description:"Landing page moderne pour activité locale.",price:50,owner:"Lucas"},
];

export default function Home(){
 const [tab,setTab]=useState("Accueil");
 const [offers,setOffers]=useState(initialOffers);
 const [title,setTitle]=useState("");
 const [description,setDescription]=useState("");
 const [price,setPrice]=useState("");
 const [search,setSearch]=useState("");
 const [notice,setNotice]=useState("");

 const filtered=useMemo(()=>offers.filter(o=>(o.title+" "+o.description+" "+o.owner).toLowerCase().includes(search.toLowerCase())),[offers,search]);
 const sales=offers.length*25;
 const commission=sales*.1;

 function publish(e:React.FormEvent){
   e.preventDefault();
   if(!title.trim()||!price)return;
   setOffers([{id:Date.now(),title:title.trim(),description:description.trim()||"Service numérique proposé sur ONEWORLD.",price:Number(price),owner:"Moi"},...offers]);
   setTitle("");setDescription("");setPrice("");setNotice("Offre publiée.");
   setTab("Marché");
 }

 return <main>
  <header className="nav">
   <button className="brand" onClick={()=>setTab("Accueil")}>◎ ONE<span>WORLD</span></button>
   <nav>{["Accueil","Marché","Vendre","Tableau de bord"].map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x}</button>)}</nav>
   <button className="primary small" onClick={()=>setTab("Vendre")}>+ Vendre</button>
  </header>

  {notice&&<div className="toast">{notice}<button onClick={()=>setNotice("")}>×</button></div>}

  {tab==="Accueil"&&<section className="hero">
   <div><span className="pill">SAAS • RDC • MONDE</span><h1>Transforme tes compétences en <em>revenus.</em></h1>
   <p>ONEWORLD permet de présenter tes services numériques, trouver des clients et suivre ton activité depuis ton téléphone.</p>
   <div className="actions"><button className="primary" onClick={()=>setTab("Vendre")}>Commencer à vendre →</button><button className="secondary" onClick={()=>setTab("Marché")}>Explorer le marché</button></div>
   <div className="stats"><b>{offers.length}+</b><span>offres</span><b>10%</b><span>commission plateforme*</span></div>
   <small>*Exemple de modèle économique : les vrais paiements doivent être connectés à un prestataire de paiement.</small></div>
   <div className="hero-card"><span>TABLEAU DE BORD</span><strong>$ {sales.toFixed(0)}</strong><p>volume simulé</p><div className="bar"><i style={{width:"68%"}}/></div><div className="mini"><div><b>$ {commission.toFixed(0)}</b><span>commission</span></div><div><b>{offers.length}</b><span>offres</span></div></div></div>
  </section>}

  {tab==="Marché"&&<section className="section"><div className="head"><div><span>PLACE DE MARCHÉ</span><h2>Trouve un service.</h2></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…"/></div><div className="grid">{filtered.map(o=><article className="card" key={o.id}><span className="tag">SERVICE</span><h3>{o.title}</h3><p>{o.description}</p><small>Par {o.owner}</small><div className="price">$ {o.price.toFixed(2)}</div><button className="primary full" onClick={()=>setNotice("Démo : le paiement sera connecté dans l'étape suivante.")}>Acheter</button></article>)}</div></section>}

  {tab==="Vendre"&&<section className="section narrow"><span>CRÉER UNE OFFRE</span><h2>Publie ton service.</h2><p>Cette première version fonctionne directement dans le navigateur. Les données de démonstration sont locales.</p><form onSubmit={publish}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nom du service" required/><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Décris ce que tu proposes…"/><input type="number" min="1" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Prix en USD" required/><button className="primary">Publier l'offre</button></form></section>}

  {tab==="Tableau de bord"&&<section className="section"><span>MON ACTIVITÉ</span><h2>Tableau de bord.</h2><div className="dashboard"><article><span>Offres</span><b>{offers.length}</b></article><article><span>Volume simulé</span><b>$ {sales.toFixed(0)}</b></article><article><span>Commission 10%</span><b>$ {commission.toFixed(0)}</b></article></div><div className="note"><b>Prochaine étape :</b> connecter l'authentification, une base de données et un prestataire de paiement compatible avec la RDC avant de traiter de vrais paiements.</div></section>}

  <footer>◎ ONEWORLD — Une plateforme numérique construite pour connecter les talents.</footer>
 </main>
}