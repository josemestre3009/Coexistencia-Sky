import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/crypto";

const COOKIE = "coexistencia_admin";
export async function currentAdmin() { const token = (await cookies()).get(COOKIE)?.value; if (!token) return null; const result = await db.query("SELECT a.id,a.email FROM admin_sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token_hash=$1 AND s.expires_at > now()", [sha256(token)]); return result.rows[0] as { id: string; email: string } | undefined; }
export async function requireAdmin() { const admin = await currentAdmin(); if (!admin) redirect("/admin/login"); return admin; }
export async function startSession(adminId: string) { const token = randomToken(); await db.query("INSERT INTO admin_sessions(admin_id,token_hash,expires_at) VALUES($1,$2,now()+interval '14 days')", [adminId, sha256(token)]); (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 1_209_600 }); }
export async function endSession() { const token = (await cookies()).get(COOKIE)?.value; if (token) await db.query("DELETE FROM admin_sessions WHERE token_hash=$1", [sha256(token)]); (await cookies()).delete(COOKIE); }
