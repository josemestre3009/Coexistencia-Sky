import Link from "next/link";
import { AppShell, Status } from "@/app/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Clients() {
  const admin=await requireAdmin();
  const clients=(await db.query("SELECT id,company_name,contact_name,email,phone,status,updated_at FROM clients ORDER BY created_at DESC")).rows;
  return <AppShell email={admin.email}><header className="page-head"><div><span className="eyebrow">Directorio</span><h1>Clientes</h1><p>{clients.length} empresas registradas en Coexistencia Sky.</p></div><Link className="button" href="/admin/clientes/nuevo">+ Nuevo cliente</Link></header><section className="card"><div className="card-head"><h2>Todos los clientes</h2><span className="status">{clients.length} registros</span></div><div className="table-wrap"><table className="table"><thead><tr><th>Empresa</th><th>Contacto</th><th>Teléfono</th><th>Estado</th><th/></tr></thead><tbody>{clients.map((c:{id:string;company_name:string;contact_name:string;email:string;phone:string;status:string})=><tr key={c.id}><td><div className="company-cell"><span className="company-initial">{c.company_name.slice(0,2).toUpperCase()}</span>{c.company_name}</div></td><td>{c.contact_name}<br/><small className="muted">{c.email}</small></td><td className="muted">{c.phone||"Sin registrar"}</td><td><Status value={c.status}/></td><td><Link href={`/admin/clientes/${c.id}`}>Abrir →</Link></td></tr>)}</tbody></table></div></section></AppShell>;
}
