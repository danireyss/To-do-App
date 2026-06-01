import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pool, { initDb } from "./database.js";

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS so the frontend dev server can reach this API
app.use(cors());
app.use(express.json());

// Serve static React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "public")));
}

// TypeScript interface for a todo item
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
}

// GET all todos, sorted newest first
app.get("/api/todos", async (_req: Request, res: Response) => {
  const result = await pool.query<Todo>(
    "SELECT * FROM todos ORDER BY created_at DESC",
  );
  res.json(result.rows);
});

// POST a new todo
app.post("/api/todos", async (req: Request, res: Response) => {
  const { text } = req.body as { text: string };
  if (!text || text.trim() === "") {
    res.status(400).json({ error: "Text is required" });
    return;
  }
  const result = await pool.query<Todo>(
    "INSERT INTO todos (text) VALUES ($1) RETURNING *",
    [text.trim()],
  );
  res.status(201).json(result.rows[0]);
});

// PUT toggles a todo's completed status
app.put("/api/todos/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const todo = await pool.query<Todo>("SELECT * FROM todos WHERE id = $1", [
    id,
  ]);
  if (todo.rows.length === 0) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }
  const result = await pool.query<Todo>(
    "UPDATE todos SET completed = NOT completed WHERE id = $1 RETURNING *",
    [id],
  );
  res.json(result.rows[0]);
});

// DELETE a todo by id
app.delete("/api/todos/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM todos WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }
  res.status(204).end();
});

// Catch-all: serve React app for non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get("/{*path}", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  });
}

// Initialize the database, then start listening
initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
