import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

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
    return res.status(400).send({ error: "No todos to summarize." });
  }

  const summary = `You have ${todos.length} tasks. Start with the most important one and check them off!`;

  res.send({ summary });
});

app.listen(process.env.PORT || 4000, () =>
  console.log(` Server on http://localhost:${process.env.PORT || 4000}`)
);
