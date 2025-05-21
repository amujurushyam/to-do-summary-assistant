import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({ apiKey: process.env });

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" MongoDB error:", err));

const Todo = mongoose.model("Todo", new mongoose.Schema({ task: String }));

app.get("/todos", async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post("/todos", async (req, res) => {
  const todo = new Todo({ task: req.body.task });
  await todo.save();
  res.json(todo);
});

app.delete("/todos/:id", async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

app.post("/summarize", async (req, res) => {
  const todos = await Todo.find();

  if (!todos.length) {
    return res.status(400).json({ error: "No todos to summarize." });
  }

  const taskList = todos.map((t) => `- ${t.task}`).join("\n");
  const firstTask = todos[0]?.task;

  const summary = `📝 You have ${todos.length} tasks pending.\nFirst priority: ${firstTask}\nTasks:\n${taskList}`;

  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: summary,
    });

    console.log("✅ Summary sent to Slack (no OpenAI)");
    res.json({ message: "Summary sent to Slack (no OpenAI)" });
  } catch (err) {
    console.error("❌ Slack send failed:", err.message);
    res.status(500).json({ error: "Failed to send summary to Slack" });
  }
});

app.listen(process.env.PORT || 4000, () =>
  console.log(` Server on http://localhost:${process.env.PORT || 4000}`)
);
