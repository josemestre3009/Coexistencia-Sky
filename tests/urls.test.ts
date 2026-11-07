import assert from "node:assert/strict";
import test from "node:test";
import { appUrl } from "../lib/urls";

test("appUrl removes duplicate path slashes", () => {
  process.env.APP_URL = "https://coexistencia.skysoluciones.com/";
  assert.equal(appUrl("/conectar/token"), "https://coexistencia.skysoluciones.com/conectar/token");
});
