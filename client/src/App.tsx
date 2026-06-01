import { useState, useEffect } from "react";
import "./App.css";

// Define the shape of a to-do item from the API
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
}

function App() {
  // State: the list of to-dos and the current input value
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  // Switch API URL between dev (Vite port) and production (same server)
  const API_URL = import.meta.env.DEV
    ? "http://localhost:3000/api/todos"
    : "/api/todos";

  // Fetch to-dos from the API when the component first loads
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const response = await fetch(API_URL);
    const data: Todo[] = await response.json();
    setTodos(data);
  }

  // Handle form submission to add a new to-do
  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTodo }),
    });
    const todo: Todo = await response.json();
    setTodos([todo, ...todos]);
    setNewTodo("");
  }

  // Toggle a to-do's completed status
  async function toggleTodo(id: number) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
    });
    const updated: Todo = await response.json();
    setTodos(todos.map((t) => (t.id === id ? updated : t)));
  }

  // Remove a to-do from the list
  async function deleteTodo(id: number) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div className="app">
      <h1>To-Do List</h1>
      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button type="submit" className="add-button">
          Add
        </button>
      </form>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? "completed" : ""}`}
          >
            <span onClick={() => toggleTodo(todo.id)} className="todo-text">
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="delete-button"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && (
        <p className="empty-message">No tasks yet. Add one above!</p>
      )}
    </div>
  );
}

export default App;
