import Link from "next/link";
import { Logo } from "@/app/components/ui";
import { login } from "../actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="login-page"><section className="login-art"><Logo/><div className="login-quote"><span className="eyebrow" style={{color:"var(--lime)"}}>Panel privado</span><h1>Todo conectado. Todo visible.</h1><p>Gestiona clientes, invitaciones y estados de WhatsApp Business desde un único lugar.</p></div><small>Coexistencia Sky · Gestión segura</small></section><section className="login-panel"><div className="login-form"><Link href="/" className="muted">← Volver al inicio</Link><h2>Bienvenido</h2><p className="muted">Introduce tus datos para continuar.</p>{error&&<p className="error">{error}</p>}<form action={login}><label>Email</label><input name="email" type="email" required autoComplete="email" placeholder="tu@email.com"/><label>Contraseña</label><input name="password" type="password" required autoComplete="current-password" placeholder="••••••••"/><button>Entrar al panel</button></form></div></section></main>;
}
