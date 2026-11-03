import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!accessToken) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const livekitUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!supabaseUrl || !supabaseAnonKey || !livekitUrl || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: "Bearer " + accessToken } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return NextResponse.json({ error: "Session invalide." }, { status: 401 });

    const body = await request.json();
    const action = body?.action;
    let roomName = String(body?.roomName || "");
    let streamId = String(body?.streamId || "");
    let isHost = false;

    if (action === "start") {
      const { count, error: countError } = await supabase
        .from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id);
      if (countError) return NextResponse.json({ error: "Impossible de vérifier tes abonnés." }, { status: 500 });
      const isTestAccount = (user.email || "").toLowerCase() === "kavasergio2022@gmail.com";
      if ((count || 0) < 500 && !isTestAccount) return NextResponse.json({ error: "Il faut au moins 500 abonnés pour lancer un LIVE." }, { status: 403 });

      roomName = "ow-" + crypto.randomUUID();
      const title = String(body?.title || "LIVE ONE WORLD").trim().slice(0, 100) || "LIVE ONE WORLD";
      const { data: stream, error: insertError } = await supabase
        .from("live_streams")
        .insert({ host_id: user.id, title, room_name: roomName, status: "live" })
        .select("id,room_name,title,host_id,started_at").single();
      if (insertError || !stream) return NextResponse.json({ error: "Impossible de créer la diffusion." }, { status: 500 });
      streamId = stream.id;
      isHost = true;
    } else if (action === "join") {
      if (!streamId) return NextResponse.json({ error: "Diffusion introuvable." }, { status: 400 });
      const { data: stream, error } = await supabase.from("live_streams")
        .select("id,room_name,host_id").eq("id", streamId).eq("status", "live").maybeSingle();
      if (error || !stream) return NextResponse.json({ error: "Cette diffusion n'est plus disponible." }, { status: 404 });
      roomName = stream.room_name;
      isHost = stream.host_id === user.id;
    } else if (action === "end") {
      if (!streamId) return NextResponse.json({ error: "Diffusion introuvable." }, { status: 400 });
      const { error } = await supabase.from("live_streams").update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", streamId).eq("host_id", user.id);
      if (error) return NextResponse.json({ error: "Impossible de terminer le LIVE." }, { status: 500 });
      return NextResponse.json({ ended: true });
    } else {
      return NextResponse.json({ error: "Action non reconnue." }, { status: 400 });
    }

    const participant = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: String(user.user_metadata?.full_name || user.email || "Membre ONE WORLD").slice(0, 80),
      ttl: "2h",
    });
    participant.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: isHost,
      canSubscribe: true,
      canPublishData: isHost,
    });
    return NextResponse.json({
      token: await participant.toJwt(),
      serverUrl: livekitUrl,
      roomName,
      streamId,
      isHost,
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne pendant la préparation du LIVE." }, { status: 500 });
  }
}
