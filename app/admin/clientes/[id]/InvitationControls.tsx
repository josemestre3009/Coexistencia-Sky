"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

export function ActionButton({ children, pendingText, className = "" }: { children: React.ReactNode; pendingText: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button className={className} disabled={pending}>{pending ? <><span className="spinner"/> {pendingText}</> : children}</button>;
}

export function InvitationPanel({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }
  return <section className="invitation-panel"><div className="invitation-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div><div className="invitation-copy"><span className="eyebrow">Enlace privado</span><h2>Invitación lista para compartir</h2><p>Este acceso es único y vence en 14 días. Compártelo únicamente con el contacto autorizado.</p></div><div className="invitation-actions"><button onClick={copy} className={copied ? "copied" : ""}>{copied ? "✓ Copiado" : "Copiar enlace"}</button><a className="button ghost" href={url} target="_blank" rel="noreferrer">Abrir ↗</a></div></section>;
}

export function TokenControl({ clientId }: { clientId: string }) {
  const [token,setToken]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const [copied,setCopied]=useState(false);
  async function reveal() { if(!window.confirm("El token permite operar este WhatsApp desde otra aplicación. ¿Mostrarlo ahora?")) return; setBusy(true); setError(""); try { const response=await fetch(`/api/admin/clients/${clientId}/token`,{method:"POST"}), data=await response.json() as {token?:string;error?:string}; if(!response.ok||!data.token) throw new Error(data.error||"No fue posible revelar el token."); setToken(data.token); } catch(cause) { setError(cause instanceof Error?cause.message:"No fue posible revelar el token."); } finally { setBusy(false); } }
  async function copy() { await navigator.clipboard.writeText(token); setCopied(true); window.setTimeout(()=>setCopied(false),2200); }
  return <div className="meta-row" style={{alignItems:"center"}}><span>Access token</span><div style={{display:"flex",gap:8,alignItems:"center",maxWidth:"70%"}}>{token?<><b style={{fontSize:".78rem",overflowWrap:"anywhere",textAlign:"right"}}>{token}</b><button type="button" onClick={copy}>{copied?"✓":"Copiar"}</button></>:<button type="button" onClick={reveal} disabled={busy}>{busy?"Revelando...":"Revelar token"}</button>}</div>{error&&<small className="error">{error}</small>}</div>;
}
