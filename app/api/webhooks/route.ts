import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { metaWebhookChanges } from "@/lib/meta-webhook";

export async function GET(request: Request) { const url=new URL(request.url); if(url.searchParams.get("hub.mode")==="subscribe"&&url.searchParams.get("hub.verify_token")===process.env.FB_VERIFY_TOKEN) return new Response(url.searchParams.get("hub.challenge")??"",{status:200}); return new Response("Forbidden",{status:403}); }

export async function POST(request: Request) {
  const raw=await request.text(), signature=request.headers.get("x-hub-signature-256")??"", secret=process.env.FB_APP_SECRET;
  if(!secret) return new Response("Meta not configured",{status:503});
  const expected=`sha256=${createHmac("sha256",secret).update(raw).digest("hex")}`;
  if(signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected))) return new Response("Invalid signature",{status:401});
  try {
    const payload=JSON.parse(raw), changes=metaWebhookChanges(payload);
    for(const change of changes) {
      const connection=(await db.query("SELECT client_id FROM meta_connections WHERE phone_number_id=$1 OR waba_id=$2 LIMIT 1",[change.phoneNumberId??null,change.wabaId??null])).rows[0];
      await db.query("INSERT INTO webhook_events(client_id,payload) VALUES($1,$2)",[connection?.client_id??null,raw]);
      if(connection) { await db.query("UPDATE meta_connections SET last_webhook_at=now(),updated_at=now() WHERE client_id=$1",[connection.client_id]); await db.query("INSERT INTO connection_events(client_id,type,message,metadata) VALUES($1,$2,$3,$4)",[connection.client_id,change.event,change.message,JSON.stringify(change)]); }
    }
    if(!changes.length) await db.query("INSERT INTO webhook_events(payload) VALUES($1)",[raw]);
  } catch(error) { console.error("Meta webhook failed:",error); return new Response("Invalid payload",{status:400}); }
  return new Response("EVENT_RECEIVED");
}
