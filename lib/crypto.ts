import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
export const randomToken = () => randomBytes(32).toString("base64url");
export const hashPassword = (password: string) => { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`; };
export const verifyPassword = (password: string, stored: string) => { const [salt, hash] = stored.split(":"); const actual = scryptSync(password, salt, 64); return timingSafeEqual(actual, Buffer.from(hash, "hex")); };

function encryptionKey() { const value = process.env.APP_ENCRYPTION_KEY; if (!value || !/^[a-f0-9]{64}$/i.test(value)) throw new Error("APP_ENCRYPTION_KEY must contain 64 hexadecimal characters"); return Buffer.from(value, "hex"); }
export function encrypt(value: string) { const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv); const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]); return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`; }
export function decrypt(value: string) { const [iv, tag, data] = value.split(".").map((part) => Buffer.from(part, "base64url")); const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv); decipher.setAuthTag(tag); return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8"); }
