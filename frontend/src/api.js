import axios from "axios";
const API = import.meta.env.VITE_BACKEND_URL;
export const fetchTodos = () => axios.get(`${API}/todos`);
export const createTodo = (task) => axios.post(`${API}/todos`, { task });
export const removeTodo = (id) => axios.delete(`${API}/todos/${id}`);
export const summarizeTodos = () => axios.post(`${API}/summarize`);
