import { db } from "@/lib/db";
import { encrypt, sha256 } from "@/lib/crypto";

type ConnectBody = { invitationToken?: string; code?: string; business_id?: string; waba_id?: string; phone_number_id?: string };

async function graph(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`https://graph.facebook.com/${process.env.FB_GRAPH_API_VERSION || "v22.0"}/${path}`, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...init?.headers }, cache: "no-store" });
  const data = await response.json() as Record<string, unknown>;
  if (!response.ok) { const detail = data.error as { message?: string } | undefined; throw new Error(detail?.message || "Meta rechazó la solicitud."); }
  return data;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ConnectBody;
    if (!body.invitationToken || !body.code || !body.waba_id || !body.phone_number_id) return Response.json({ error: "Faltan datos de la conexión." }, { status: 400 });
    const invitation = (await db.query("SELECT i.id,c.id client_id FROM invitations i JOIN clients c ON c.id=i.client_id WHERE i.token_hash=$1 AND i.revoked_at IS NULL AND i.expires_at>now()", [sha256(body.invitationToken)])).rows[0];
    if (!invitation) return Response.json({ error: "La invitación ya no es válida." }, { status: 403 });
    const appId = process.env.FB_APP_ID, appSecret = process.env.FB_APP_SECRET;
    if (!appId || !appSecret) return Response.json({ error: "Meta no está configurado en el servidor." }, { status: 503 });
    const params = new URLSearchParams({ client_id: appId, client_secret: appSecret, code: body.code });
    const tokenResponse = await fetch(`https://graph.facebook.com/${process.env.FB_GRAPH_API_VERSION || "v22.0"}/oauth/access_token?${params}`, { cache: "no-store" });
    const tokenData = await tokenResponse.json() as { access_token?: string; error?: { message?: string } };
    if (!tokenResponse.ok || !tokenData.access_token) throw new Error(tokenData.error?.message || "Meta no entregó un token de acceso.");
    const accessToken = tokenData.access_token;
    await graph(`${body.waba_id}/subscribed_apps`, accessToken, { method: "POST", body: "{}" });
    if (process.env.FB_REG_PIN) await graph(`${body.phone_number_id}/register`, accessToken, { method: "POST", body: JSON.stringify({ messaging_product: "whatsapp", pin: process.env.FB_REG_PIN }) });
    const phone = await graph(`${body.phone_number_id}?fields=display_phone_number,verified_name`, accessToken);
    await db.query("BEGIN");
    try {
      await db.query("INSERT INTO meta_connections(client_id,business_id,waba_id,phone_number_id,display_phone_number,access_token_encrypted,status,webhook_subscribed,last_synced_at) VALUES($1,$2,$3,$4,$5,$6,'connected',true,now()) ON CONFLICT(client_id) DO UPDATE SET business_id=excluded.business_id,waba_id=excluded.waba_id,phone_number_id=excluded.phone_number_id,display_phone_number=excluded.display_phone_number,access_token_encrypted=excluded.access_token_encrypted,status='connected',webhook_subscribed=true,last_synced_at=now(),updated_at=now()", [invitation.client_id, body.business_id || null, body.waba_id, body.phone_number_id, phone.display_phone_number || null, encrypt(accessToken)]);
      await db.query("UPDATE clients SET status='connected',updated_at=now() WHERE id=$1", [invitation.client_id]);
      await db.query("UPDATE invitations SET used_at=now() WHERE id=$1", [invitation.id]);
      await db.query("INSERT INTO connection_events(client_id,type,message,metadata) VALUES($1,'connected','WhatsApp Business conectado mediante Meta Embedded Signup',$2)", [invitation.client_id, JSON.stringify({ waba_id: body.waba_id, phone_number_id: body.phone_number_id })]);
      await db.query("COMMIT");
    } catch (error) { await db.query("ROLLBACK"); throw error; }
    return Response.json({ status: "connected" });
  } catch (error) {
    console.error("Meta connection failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible completar la conexión." }, { status: 502 });
  }
}
