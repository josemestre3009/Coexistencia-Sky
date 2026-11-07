import { Logo } from "@/app/components/ui";

export default function Confirmation() {
  return <main className="connect-page"><section className="connect-card confirmation-card"><Logo/><div className="confirmation-check" aria-hidden="true">✓</div><span className="eyebrow">Conexión completada</span><h1>Todo quedó listo</h1><p className="lead">Tu cuenta de WhatsApp Business fue vinculada correctamente. El equipo de Sky Soluciones ya puede validar la conexión.</p><div className="notice"><b>No necesitas hacer nada más.</b><p className="muted">Puedes cerrar esta ventana con tranquilidad.</p></div></section></main>;
}
