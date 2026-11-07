import { Pool } from "pg";

const globalForDb = global as typeof global & { pool?: Pool };
export const db = globalForDb.pool ?? new Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : undefined);
if (process.env.NODE_ENV !== "production") globalForDb.pool = db;
