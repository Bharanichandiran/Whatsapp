import express from "express";
import ProcessedMessage from "../models/ProcessedMessage.js";

const router = express.Router();

// GET messages for a specific wa_id
router.get("/messages", async (req, res) => {
  const wa_id = req.query.wa_id;
  if (!wa_id) {
    return res.status(400).json({ error: "Missing wa_id query parameter" });
  }
  try {
    const messages = await ProcessedMessage.find({
      $or: [{ wa_id }, { from: wa_id }]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all chats grouped by wa_id
// GET all chats grouped by wa_id
router.get("/chats", async (req, res) => {
  try {
    const messages = await ProcessedMessage.find().sort({ timestamp: 1 });
    const grouped = {};

    messages.forEach((msg) => {
      const chatId = msg.wa_id || msg.from;
      if (!grouped[chatId]) {
        grouped[chatId] = {
          wa_id: chatId,
          name: msg.name || "Unknown",
          messages: []
        };
      }
      grouped[chatId].messages.push(msg);
    });

    const chatList = Object.values(grouped)
      .map((chat) => {
        const lastMsg = chat.messages[chat.messages.length - 1];
        return {
          wa_id: chat.wa_id,
          name: chat.name,
          last_message: lastMsg?.text || "",
          last_updated: lastMsg?.timestamp
            ? new Date(lastMsg.timestamp).toISOString()
            : null,
          messages: chat.messages
        };
      })
      .sort((a, b) => {
        const lastA = a.last_updated ? new Date(a.last_updated) : 0;
        const lastB = b.last_updated ? new Date(b.last_updated) : 0;
        return lastB - lastA;
      });

    res.json(chatList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST a new message
router.post("/messages", async (req, res) => {
  const { wa_id, text } = req.body;

  if (!wa_id || !text) {
    return res.status(400).json({ error: "wa_id and text are required" });
  }

  try {
    const newMessage = new ProcessedMessage({
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, // unique ID
      wa_id,
      from: "918329446654", // sender number (you)
      name: "Me",
      text,
      timestamp: new Date(),
      status: "sent"
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
