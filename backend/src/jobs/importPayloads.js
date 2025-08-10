// src/jobs/importPayloads.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "../lib/dbConnect.js";
import ProcessedMessage from "../models/ProcessedMessage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const payloadsDir = path.join(__dirname, "../payloads");

const runImport = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    const files = fs.readdirSync(payloadsDir).filter(file => file.endsWith(".json"));
    console.log(`📂 Found ${files.length} JSON files`);

    for (const file of files) {
      const filePath = path.join(payloadsDir, file);
      const rawData = fs.readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(rawData);

      const entry = jsonData?.metaData?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      // 1️⃣ Handle incoming/outgoing message payloads
      if (change?.field === "messages" && value?.messages?.length) {
        const contact = value.contacts?.[0] || {};
        const message = value.messages?.[0] || {};

        await ProcessedMessage.updateOne(
          { id: message.id },
          {
            id: message.id,
            wa_id: contact.wa_id || null,
            from: message.from || null,
            name: contact.profile?.name || null,
            text: message.text?.body || null,
            timestamp: new Date(parseInt(message.timestamp, 10) * 1000),
            status: null // will be updated later if a status payload exists
          },
          { upsert: true }
        );
      }

      // 2️⃣ Handle status update payloads
      if (change?.field === "messages" && value?.statuses?.length) {
        for (const statusObj of value.statuses) {
          await ProcessedMessage.updateOne(
            { id: statusObj.id }, // Match by message ID
            {
              status: statusObj.status,
              timestamp: statusObj.timestamp
                ? new Date(parseInt(statusObj.timestamp, 10) * 1000)
                : undefined
            }
          );
        }
      }
    }

    console.log("🎯 Import complete");
    process.exit();
  } catch (err) {
    console.error("❌ Import error:", err);
    process.exit(1);
  }
};

runImport();
