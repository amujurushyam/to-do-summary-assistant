import { useEffect, useState } from 'react';
import { fetchTodos, createTodo, removeTodo, summarizeTodos } from './api';
import TodoItem from './TodoItem';
import './index.css';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('');

  const loadTodos = async () => {
    try {
      const res = await fetchTodos();
      setTodos(Array.isArray(res.data) ? res.data : []);
    } catch {
      setStatus(' Failed to load todos.');
      setTodos([]);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleAdd = async () => {
    if (!input.trim()) return;
    await createTodo(input);
    setInput('');
    loadTodos();
  };

  const handleDelete = async (id) => {
    await removeTodo(id);
    loadTodos();
  };

  const handleSummarize = async () => {
    setStatus(' Summarizing...');
    try {
      await summarizeTodos();
      setStatus(' Summary sent to Slack!');
    } catch {
      setStatus(' Failed to summarize or send to Slack.');
    }
  };

  return (
    <div className="app">
      <h1>  Todo Summary Assistant</h1>
      <div className="add-todo">
        <input
          type="text"
          placeholder="Enter a task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
      <div className="todo-list">
        {todos.map((todo) => (
          <TodoItem key={todo._id} todo={todo} onDelete={handleDelete} />
        ))}
      </div>
      <button className="summarize" onClick={handleSummarize}>
        Summarize & Send to Slack
      </button>
      {status && (
        <p className={`status ${status.includes('Failed') ? 'error' : status.includes('Summary sent') ? 'success' : ''}`}>
          {status.includes('Failed') && '❌ '}
          {status.includes('Summary sent') && '✅ '}
          {status}
        </p>
      )}
    </div>
  );
}
