const express = require('express');
const router = express.Router();
const WebhookEvent = require('../models/WebhookEvent');

// Optional simple API key protection for webhook (set API_KEY in .env)
function checkApiKey(req, res, next) {
  const key = process.env.API_KEY;
  if (!key) return next(); // no key set -> allow
  const provided = req.headers['x-api-key'] || req.query.api_key;
  if (provided && provided === key) return next();
  return res.status(401).json({ success: false, error: 'Unauthorized' });
}

router.post('/', checkApiKey, async (req, res) => {
  try {
    const payload = req.body;
    // store raw payload
    const doc = await WebhookEvent.create({ payload_type: payload.payload_type || 'whatsapp_webhook', metaData: payload.metaData || payload.metaData, raw: payload });
    return res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    console.error('webhook save error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;