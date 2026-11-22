export type MetaWebhookChange={ phoneNumberId?:string; wabaId?:string; event:string; message?:string };
type WebhookValue={metadata?:{phone_number_id?:string};messages?:Array<{from?:string;type?:string}>;statuses?:Array<{status?:string;recipient_id?:string}>};
type WebhookPayload={entry?:Array<{id?:string;changes?:Array<{field?:string;value?:WebhookValue}>}>};

export function metaWebhookChanges(payload: unknown): MetaWebhookChange[] {
  const root=payload as WebhookPayload;
  return (root.entry??[]).flatMap(entry=>(entry.changes??[]).filter(change=>change.field==="messages").map(change=>{
    const value=change.value??{}, message=value.messages?.[0], status=value.statuses?.[0];
    if(message) return {phoneNumberId:value.metadata?.phone_number_id,wabaId:entry.id,event:"message_received",message:`Mensaje entrante${message.from?` de ${message.from}`:""}${message.type?` (${message.type})`:""}`};
    if(status) return {phoneNumberId:value.metadata?.phone_number_id,wabaId:entry.id,event:`message_${status.status??"updated"}`,message:`Mensaje ${status.status??"actualizado"}${status.recipient_id?` para ${status.recipient_id}`:""}`};
    return {phoneNumberId:value.metadata?.phone_number_id,wabaId:entry.id,event:"webhook_received",message:"Evento de WhatsApp recibido"};
  }));
}
