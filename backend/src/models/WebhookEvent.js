const mongoose = require('mongoose');

const WebhookEventSchema = new mongoose.Schema(
  {
    payload_type: { type: String },
    metaData: { type: mongoose.Schema.Types.Mixed },
    raw: { type: mongoose.Schema.Types.Mixed } // store the entire payload as-is for convenience
  },
  { timestamps: true }
);

module.exports = mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', WebhookEventSchema);
