import Link from "next/link";
import { AppShell } from "@/app/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "../../actions";

export default async function NewClient({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const admin=await requireAdmin(); const {error}=await searchParams;
  return <AppShell email={admin.email}><header className="page-head"><div><span className="eyebrow">Alta de cliente</span><h1>Nueva conexión</h1><p>Registra la empresa. La invitación se genera automáticamente.</p></div><Link className="button ghost" href="/admin/clientes">Cancelar</Link></header><section className="card" style={{maxWidth:760}}>{error&&<p className="error">{error}</p>}<form action={createClient}><div className="form-grid"><div><label>Nombre de la empresa</label><input name="company" required placeholder="Ej. Estudio Horizonte"/></div><div><label>Persona de contacto</label><input name="contact" required placeholder="Nombre y apellido"/></div><div><label>Correo electrónico</label><input name="email" type="email" required placeholder="contacto@empresa.com"/></div><div><label>Teléfono</label><input name="phone" placeholder="+57 300 000 0000"/></div></div><label>Notas internas</label><textarea name="notes" placeholder="Contexto comercial, observaciones o próximos pasos..."/><div className="notice"><b>Invitación protegida</b><p className="muted">El enlace será válido durante 14 días. Solo se mostrará una vez al crearlo.</p></div><div className="form-actions"><button>Crear cliente e invitación</button><Link className="button ghost" href="/admin/clientes">Volver</Link></div></form></section></AppShell>;
}
