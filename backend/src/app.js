import express from "express";
import cors from 'cors';
import authRoutes from "./routes/auth.route.js";
import drugRoutes from "./routes/drug.route.js";
import diseaseRoutes from "./routes/disease.route.js";
import chatbotRoutes from "./routes/chatbot.route.js";
import forumRoutes from "./routes/forum.route.js";
import searchRoutes from "./routes/search.route.js";
import commmentRoutes from "./routes/comment.route.js"; 


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/drugs", drugRoutes);
app.use("/api/diseases", diseaseRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/comments", commmentRoutes);

export default app;
