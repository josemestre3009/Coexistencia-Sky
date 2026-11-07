import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword, sha256 } from "../lib/crypto";

test("password hashes verify only their source", () => { const hash=hashPassword("safe-password"); assert.equal(verifyPassword("safe-password",hash),true); assert.equal(verifyPassword("wrong",hash),false); assert.notEqual(sha256("one"),sha256("two")); });
