function toNumberTimestamp(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return Math.floor(Date.now() / 1000);
  return n > 1e12 ? Math.floor(n / 1000) : n;
}

function normalizeNumber(s) {
  if (!s) return '';
  return String(s).replace(/\D/g, '');
}

function isBusinessNumber(from, businessNumber) {
  if (!from || !businessNumber) return false;
  const a = normalizeNumber(from);
  const b = normalizeNumber(businessNumber);
  if (!a || !b) return false;
  return a.endsWith(b.slice(-8));
}

function parseWebhookEventsToMessages(events = [], opts = {}) {
  const { phone, conversationId } = opts;
  const msgsById = new Map();
  const statuses = [];

  for (const e of events) {
    const entries = e.metaData?.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};

        // collect statuses
        if (Array.isArray(value.statuses)) {
          for (const s of value.statuses) statuses.push(s);
        }

        // collect messages
        if (Array.isArray(value.messages)) {
          for (const m of value.messages) {
            const id = m.id;
            if (!id) continue;

            // optional filtering by phone or conversationId
            if (phone) {
              const contacts = value.contacts || [];
              const found = contacts.some(c => normalizeNumber(c?.wa_id) === normalizeNumber(phone));
              if (!found) continue;
            }
            if (conversationId) {
              const conv = m?.conversation?.id || value?.metadata?.conversation_id || entry?.id;
              if (conv && conv !== conversationId) continue;
            }

            const timestamp = toNumberTimestamp(m.timestamp);
            const text = m.text?.body || '';
            const from = m.from || '';
            const businessNumber = value?.metadata?.display_phone_number;
            const senderType = isBusinessNumber(from, businessNumber) ? 'business' : 'user';

            if (!msgsById.has(id)) {
              msgsById.set(id, {
                id,
                conversationId: m?.conversation?.id || undefined,
                from,
                text,
                timestamp,
                senderType,
                status: undefined
              });
            } else {
              // merge
              const existing = msgsById.get(id);
              if (!existing.text && text) existing.text = text;
              if (!existing.timestamp && timestamp) existing.timestamp = timestamp;
            }
          }
        }
      }
    }
  }

  // attach statuses
  for (const s of statuses) {
    // match by meta_msg_id or id
    const matchId = s.meta_msg_id || s.id;
    const recipient = s.recipient_id;
    const st = (s.status || '').toLowerCase();

    if (!matchId) continue;
    if (!msgsById.has(matchId)) continue;
    const msg = msgsById.get(matchId);
    // prefer latest status precedence (read > delivered > sent)
    const rank = (v) => (v === 'read' ? 3 : v === 'delivered' ? 2 : v === 'sent' ? 1 : 0);
    if (!msg.status || rank(st) >= rank(msg.status)) msg.status = st;
  }

  // convert to array and sort
  const arr = Array.from(msgsById.values()).sort((a, b) => a.timestamp - b.timestamp);
  return arr;
}

module.exports = { parseWebhookEventsToMessages };
