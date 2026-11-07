import { notFound } from "next/navigation";
import { Logo } from "@/app/components/ui";
import { db } from "@/lib/db";
import { sha256 } from "@/lib/crypto";
import MetaSignup from "./MetaSignup";

export default async function Connect({ params }: { params: Promise<{ token: string }> }) {
  const {token}=await params;
  const invitation=(await db.query("SELECT i.id,c.company_name,c.contact_name,c.status FROM invitations i JOIN clients c ON c.id=i.client_id WHERE i.token_hash=$1 AND i.revoked_at IS NULL AND i.expires_at>now()",[sha256(token)])).rows[0];
  if(!invitation) notFound();
  const configured=Boolean(process.env.FB_APP_ID&&process.env.FB_CONFIG_ID);
  return <main className="connect-page"><section className="connect-card"><Logo/><div style={{marginTop:42}}><span className="eyebrow">Conexión segura</span><h1>Conecta {invitation.company_name}</h1><p className="lead">Hola, {invitation.contact_name}. Vincula WhatsApp Business directamente con Meta. Tus credenciales nunca se comparten con terceros.</p></div>{configured?<><div className="notice"><b>Todo listo para comenzar</b><p className="muted">Meta abrirá una ventana segura para completar el proceso.</p></div><MetaSignup appId={process.env.FB_APP_ID!} configId={process.env.FB_CONFIG_ID!} version={process.env.FB_GRAPH_API_VERSION||"v22.0"} invitationToken={token}/></>:<div className="notice"><b>Estamos preparando tu conexión</b><p className="muted">La integración con Meta aún no está configurada.</p></div>}<p className="hero-note">Enlace privado · Conexión cifrada · Acceso temporal</p></section></main>;
}
