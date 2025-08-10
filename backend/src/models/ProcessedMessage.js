import mongoose from "mongoose";

const ProcessedMessageSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  wa_id: String,
  from: String,
  name: String,
  text: String,
  timestamp: Date,
  status: { type: String, enum: ["sent", "delivered", "read", null]}
});

export default mongoose.model("ProcessedMessage", ProcessedMessageSchema);
