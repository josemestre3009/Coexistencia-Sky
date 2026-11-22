import { currentAdmin } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { db } from "@/lib/db";

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
  if(!await currentAdmin()) return Response.json({error:"No autorizado"},{status:401});
  const {id}=await params;
  const row=(await db.query("SELECT access_token_encrypted FROM meta_connections WHERE client_id=$1",[id])).rows[0] as {access_token_encrypted?:string}|undefined;
  if(!row?.access_token_encrypted) return Response.json({error:"Este cliente no tiene token Meta."},{status:404});
  try { return Response.json({token:decrypt(row.access_token_encrypted)}); }
  catch { return Response.json({error:"No fue posible leer el token."},{status:500}); }
}
