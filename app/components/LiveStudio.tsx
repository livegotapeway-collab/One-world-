"use client";

import { useCallback, useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { supabase } from "../../lib/supabase";

type Stream = { id: string; title: string; room_name: string; host_id: string; started_at: string; host?: { full_name?: string; username?: string } | null };
type Connection = { token: string; serverUrl: string; roomName: string; streamId: string; isHost: boolean };

export default function LiveStudio({ user, followerCount }: { user: any; followerCount: number }) {
  const isTestAccount = (user?.email || "").toLowerCase() === "kavasergio2022@gmail.com";
  const canStartLive = followerCount >= 500 || isTestAccount;
  const [streams, setStreams] = useState<Stream[]>([]);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [liveStatus, setLiveStatus] = useState("Connexion à la salle LIVE…");

  const loadStreams = useCallback(async () => {
    const { data, error } = await supabase.from("live_streams")
      .select("id,title,room_name,host_id,started_at")
      .eq("status", "live").order("started_at", { ascending: false }).limit(30);
    if (error) { setNotice("Chargement des directs impossible : " + error.message); return; }
    const rows = (data || []) as Stream[];
    const ids = [...new Set(rows.map(row => row.host_id))];
    const { data: profiles } = ids.length
      ? await supabase.from("profiles").select("id,full_name,username").in("id", ids)
      : { data: [] as any[] };
    setStreams(rows.map(row => ({ ...row, host: profiles?.find((profile: any) => profile.id === row.host_id) || null })));
  }, []);

  useEffect(() => { void loadStreams(); const timer = window.setInterval(() => void loadStreams(), 15000); return () => window.clearInterval(timer); }, [loadStreams]);

  async function callLive(action: "start" | "join" | "end", stream?: Stream) {
    if (!user) { setNotice("Connecte-toi pour utiliser ONE WORLD LIVE."); return; }
    setBusy(true); setNotice("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const access = sessionData.session?.access_token;
      if (!access) throw new Error("Ta session a expiré. Reconnecte-toi.");
      const response = await fetch("/api/live/token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + access },
        body: JSON.stringify({
          action,
          title,
          streamId: stream?.id || connection?.streamId,
          roomName: stream?.room_name || connection?.roomName,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Action LIVE impossible.");
      if (action === "end") {
        setConnection(null);
        await loadStreams();
        setNotice("Ton direct est terminé.");
      } else {
        setConnection(result as Connection);
        await loadStreams();
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally { setBusy(false); }
  }

  if (connection) {
    return <section className="page-section live-studio">
      <div className="page-heading"><div><span className="section-kicker">ONE WORLD LIVE</span><h1>{connection.isHost ? "Ton direct est en cours." : "Tu regardes un direct."}</h1><p>Respecte les autres membres et les règles de la communauté.</p></div>
        {connection.isHost && <button className="button button-ghost" disabled={busy} onClick={() => void callLive("end")}>{busy ? "Fermeture..." : "Terminer le LIVE"}</button>}
        {!connection.isHost && <button className="button button-ghost" onClick={() => setConnection(null)}>Quitter</button>}
      </div>
      <div style={{ height: "min(68vh, 680px)", minHeight: 360, overflow: "hidden", borderRadius: 18, background: "#101713" }}>
        <LiveKitRoom
          token={connection.token}
          serverUrl={connection.serverUrl}
          connect
          audio
          video
          onConnected={() => setLiveStatus("Connecté à la salle LIVE.")}
          onDisconnected={(reason) => setLiveStatus("Connexion interrompue" + (reason ? " : " + String(reason) : ".") + " Tu peux réessayer ou quitter la salle.")}
          onError={(error) => setNotice("Erreur LiveKit : " + (error?.message || "connexion impossible"))}
          onMediaDeviceFailure={(failure, kind) => setNotice((kind === "audioinput" ? "Microphone" : kind === "videoinput" ? "Caméra" : "Appareil") + " indisponible (" + String(failure || "autorisation refusée") + "). Vérifie les autorisations du navigateur.")}
          style={{ height: "100%" }}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
      <p className="notice" role="status">{liveStatus}</p>
      {notice && <p className="notice" role="alert">{notice}</p>}
    </section>;
  }

  return <section className="page-section live-studio">
    <div className="page-heading"><div><span className="section-kicker">DIFFUSION EN DIRECT</span><h1>ONE WORLD LIVE.</h1><p>Partage tes moments en vidéo avec la communauté.</p></div><button className="button button-ghost" onClick={() => void loadStreams()}>Actualiser</button></div>
    <div className="live-coming-card">
      <span className="live-coming-icon">◉</span>
      <div><b>Accès créateur</b><p>{user ? canStartLive ? (isTestAccount && followerCount < 500 ? "Mode test activé pour ton compte. Tu peux essayer un direct sans les 500 abonnés." : "Tu remplis le critère des 500 abonnés. Tu peux lancer ton direct.") : "Tu as " + followerCount + " abonnés sur 500. Il t'en manque " + (500 - followerCount) + "." : "Connecte-toi pour vérifier ton éligibilité."}</p><p className="form-hint">Le seuil de 500 abonnés est également contrôlé côté serveur avant chaque démarrage.</p></div>
      <span className="live-soon-badge">{user && canStartLive ? (isTestAccount && followerCount < 500 ? "MODE TEST" : "ÉLIGIBLE") : "500 ABONNÉS"}</span>
    </div>
    {user && canStartLive && <form className="offer-form" onSubmit={event => { event.preventDefault(); void callLive("start"); }}>
      <label>Titre du direct<input value={title} onChange={event => setTitle(event.target.value)} maxLength={100} placeholder="Ex. : Discussion avec la communauté" /></label>
      <button className="button button-green" disabled={busy}>{busy ? "Préparation..." : "◉ Démarrer mon LIVE"}</button>
    </form>}
    {!user && <div className="login-prompt"><p>Connecte-toi pour lancer ou regarder un direct.</p></div>}
    <div className="dashboard-list"><div className="list-heading"><h3>Directs en cours</h3><span className="muted-copy">{streams.length} diffusion(s)</span></div>
      {streams.length ? streams.map(stream => <div className="dashboard-offer" key={stream.id}><span className="offer-mini-icon">🔴</span><span><b>{stream.title}</b><small>{stream.host?.full_name || stream.host?.username || "Créateur ONE WORLD"} · {new Date(stream.started_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</small></span><button className="button button-dark compact" disabled={busy || !user} onClick={() => void callLive("join", stream)}>Rejoindre ↗</button></div>) : <p className="muted-copy">Aucun direct en cours pour le moment.</p>}
    </div>
    {notice && <p className="notice" role="status">{notice}</p>}
  </section>;
}
