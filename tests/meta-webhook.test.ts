import assert from "node:assert/strict";
import test from "node:test";
import { metaWebhookChanges } from "../lib/meta-webhook";

test("extracts incoming WhatsApp message ownership",()=>assert.deepEqual(metaWebhookChanges({entry:[{id:"waba",changes:[{field:"messages",value:{metadata:{phone_number_id:"phone"},messages:[{from:"57300",type:"text"}]}}]}]}),[{wabaId:"waba",phoneNumberId:"phone",event:"message_received",message:"Mensaje entrante de 57300 (text)"}]));
