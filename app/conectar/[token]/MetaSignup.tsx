"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SignupData = { business_id?: string; waba_id?: string; phone_number_id?: string };
type FacebookResponse = { authResponse?: { code?: string } };
type FacebookSdk = {
  init(options: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void;
  login(callback: (response: FacebookResponse) => void, options: Record<string, unknown>): void;
};

declare global { interface Window { FB?: FacebookSdk; fbAsyncInit?: () => void } }

export default function MetaSignup({ appId, configId, version, invitationToken }: { appId: string; configId: string; version: string; invitationToken: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const code = useRef("");
  const signup = useRef<SignupData>({});
  const submitted = useRef(false);

  const complete = useCallback(async () => {
    if (submitted.current || !code.current || !signup.current.waba_id || !signup.current.phone_number_id) return;
    submitted.current = true;
    try {
      const response = await fetch("/api/meta/connect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ invitationToken, code: code.current, ...signup.current }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "No fue posible guardar la conexión.");
      router.replace("/confirmacion");
    } catch (cause) {
      submitted.current = false;
      setBusy(false);
      setError(cause instanceof Error ? cause.message : "No fue posible completar la conexión.");
    }
  }, [invitationToken, router]);

  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;
      let message: unknown = event.data;
      try { if (typeof message === "string") message = JSON.parse(message); } catch { return; }
      const payload = message as { type?: string; event?: string; data?: SignupData };
      if (payload.type !== "WA_EMBEDDED_SIGNUP") return;
      if (payload.event === "FINISH" && payload.data) { signup.current = payload.data; void complete(); }
      if (payload.event === "CANCEL") { setBusy(false); setError("El proceso fue cancelado. Puedes intentarlo de nuevo."); }
      if (payload.event === "ERROR") { setBusy(false); setError("Meta reportó un error durante la conexión."); }
    };
    window.addEventListener("message", receiveMessage);
    window.fbAsyncInit = () => { window.FB?.init({ appId, cookie: true, xfbml: true, version }); setReady(true); };
    if (window.FB) window.fbAsyncInit();
    else if (!document.getElementById("facebook-jssdk")) { const script = document.createElement("script"); script.id = "facebook-jssdk"; script.async = true; script.defer = true; script.crossOrigin = "anonymous"; script.src = "https://connect.facebook.net/es_LA/sdk.js"; document.body.appendChild(script); }
    return () => window.removeEventListener("message", receiveMessage);
  }, [appId, complete, version]);

  function launch() {
    setError(""); setBusy(true); submitted.current = false; code.current = ""; signup.current = {};
    window.FB?.login((response) => {
      if (!response.authResponse?.code) { setBusy(false); setError("Meta no autorizó la conexión. Revisa los permisos e inténtalo otra vez."); return; }
      code.current = response.authResponse.code;
      void complete();
    }, { config_id: configId, response_type: "code", override_default_response_type: true, extras: { setup: {}, featureType: "whatsapp_business_app_onboarding", sessionInfoVersion: "3" } });
  }

  return <><button onClick={launch} disabled={!ready || busy}>{busy ? "Esperando a Meta..." : ready ? "Continuar con Meta →" : "Cargando Meta..."}</button>{error&&<p className="error">{error}</p>}<p className="hero-note">Permite ventanas emergentes para este sitio.</p></>;
}
