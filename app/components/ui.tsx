import Link from "next/link";
import type { ReactNode } from "react";

export function Logo() {
  return <Link className="brand" href="/"><span className="brand-mark"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 8.5C6 5.46 8.46 3 11.5 3h5.25L13.5 7H16a2 2 0 0 1 2 2v6.5c0 3.04-2.46 5.5-5.5 5.5S7 18.54 7 15.5V13h4v2.5a1.5 1.5 0 0 0 3 0V11h-2.5A5.5 5.5 0 0 1 6 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>Coexistencia Sky</span></Link>;
}

const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
};
function Icon({ name }: { name: keyof typeof icons }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>; }

export function AppShell({ children, email, logout }: { children: ReactNode; email?: string; logout?: ReactNode }) {
  return <div className="app-layout"><aside className="sidebar"><Logo/><nav className="sidebar-nav"><Link href="/admin"><Icon name="grid"/><span>Resumen</span></Link><Link href="/admin/clientes"><Icon name="users"/><span>Clientes</span></Link><Link href="/admin/clientes/nuevo"><Icon name="plus"/><span>Nuevo cliente</span></Link></nav>{email&&<div className="sidebar-foot"><small>Sesión iniciada como</small><strong>{email}</strong>{logout}</div>}</aside><main className="app-main">{children}</main></div>;
}

export function Status({ value }: { value: string }) {
  const labels: Record<string,string> = { pending: "Pendiente", connecting: "Conectando", connected: "Conectado", error: "Con error", revoked: "Revocado", disconnected: "Desconectado" };
  return <span className={`status ${value}`}>{labels[value] ?? value}</span>;
}
