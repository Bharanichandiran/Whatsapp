export function parsePayload(payload) {
  const messages = [];
  const statuses = [];

  const entry = payload?.entry?.[0];
  if (!entry) return { messages, statuses };

  const change = entry?.changes?.[0];
  const value = change?.value;

  if (value?.messages) {
    value.messages.forEach(msg => {
      messages.push({
        id: msg.id,
        wa_id: value?.contacts?.[0]?.wa_id,
        from: msg.from,
        name: value?.contacts?.[0]?.profile?.name || "",
        text: msg?.text?.body || "",
        timestamp: new Date(parseInt(msg.timestamp) * 1000),
        status: null
      });
    });
  }

  if (value?.statuses) {
    value.statuses.forEach(st => {
      statuses.push({
        id: st.id,
        status: st.status
      });
    });
  }

  return { messages, statuses };
}
