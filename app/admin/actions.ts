"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { endSession, requireAdmin, startSession } from "@/lib/auth";
import { randomToken, sha256, verifyPassword } from "@/lib/crypto";

const text = (form: FormData, name: string, max = 500) => String(form.get(name) ?? "").trim().slice(0, max);
export async function login(form: FormData) { const email = text(form, "email", 254).toLowerCase(); const password = String(form.get("password") ?? ""); const result = await db.query("SELECT id,password_hash FROM admins WHERE email=$1", [email]); if (!result.rowCount || !verifyPassword(password, result.rows[0].password_hash)) redirect("/admin/login?error=Credenciales%20incorrectas"); await startSession(result.rows[0].id); redirect("/admin"); }
export async function logout() { await endSession(); redirect("/"); }
export async function createClient(form: FormData) { await requireAdmin(); const company = text(form,"company",160), contact = text(form,"contact",160), email = text(form,"email",254).toLowerCase(), phone = text(form,"phone",40), notes = text(form,"notes",5000); if (!company || !contact || !email) redirect("/admin/clientes/nuevo?error=Completa%20empresa,%20contacto%20y%20email"); const client = await db.query("INSERT INTO clients(company_name,contact_name,email,phone,notes) VALUES($1,$2,$3,$4,$5) RETURNING id", [company,contact,email,phone,notes]); await createInvitation(client.rows[0].id); redirect(`/admin/clientes/${client.rows[0].id}`); }
export async function createInvitation(clientId: string) { await requireAdmin(); const token = randomToken(); await db.query("INSERT INTO invitations(client_id,token_hash,expires_at) VALUES($1,$2,now()+interval '14 days')", [clientId,sha256(token)]); return token; }
export async function regenerateInvitation(form: FormData) { await requireAdmin(); const id = text(form,"clientId",36); await db.query("UPDATE invitations SET revoked_at=now() WHERE client_id=$1 AND revoked_at IS NULL",[id]); const token = await createInvitation(id); redirect(`/admin/clientes/${id}?invite=${token}`); }
export async function revokeInvitation(form: FormData) { await requireAdmin(); const id=text(form,"clientId",36); await db.query("UPDATE invitations SET revoked_at=now() WHERE client_id=$1 AND revoked_at IS NULL",[id]); redirect(`/admin/clientes/${id}`); }
