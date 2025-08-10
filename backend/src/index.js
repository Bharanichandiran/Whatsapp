import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/dbConnect.js";
import apiRoutes from "./routes/api.js";
import cors from 'cors';
import chatsRouter from './routes/api.js'; // your router file

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use("/api/chats", chatsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
