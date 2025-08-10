import express from "express";
import ProcessedMessage from "../models/ProcessedMessage.js";

const router = express.Router();

// Get all chats grouped by wa_id
router.get("/chats", async (req, res) => {
  try {
    const messages = await ProcessedMessage.find().sort({ timestamp: 1 });
    const grouped = {};

    messages.forEach((msg) => {
      const chatId = msg.wa_id || msg.from; // fallback if wa_id missing
      if (!grouped[chatId]) {
        grouped[chatId] = {
          wa_id: chatId,
          name: msg.name || "Unknown",
          messages: [],
        };
      }
      grouped[chatId].messages.push(msg);
    });

    // Convert object to array and sort by last message timestamp (descending)
    const chatList = Object.values(grouped).sort((a, b) => {
      const lastA = a.messages[a.messages.length - 1]?.timestamp || 0;
      const lastB = b.messages[b.messages.length - 1]?.timestamp || 0;
      return new Date(lastB) - new Date(lastA);
    });

    res.json(chatList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a specific wa_id
router.get("/messages", async (req, res) => {
  const wa_id = req.query.wa_id;
  if (!wa_id) {
    return res.status(400).json({ error: "Missing wa_id query parameter" });
  }
  try {
    const messages = await ProcessedMessage.find({
      $or: [{ wa_id }, { from: wa_id }],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new message
router.post("/messages", async (req, res) => {
  const { wa_id, text } = req.body;
  if (!wa_id || !text) {
    return res.status(400).json({ error: "wa_id and text are required" });
  }

  try {
    const newMessage = new ProcessedMessage({
      id: `msg-${Date.now()}`, // optional unique ID
      wa_id,
      from: "918329446654",    // ✅ your own number
      name: "Me",              // optional name
      text,
      timestamp: new Date(),
      status: "sent",
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
