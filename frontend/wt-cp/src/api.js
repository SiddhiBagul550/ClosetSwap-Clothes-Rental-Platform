import axios from "axios";

export const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api/v1";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function errMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

/* Same convention as the rest of the app: session lives in localStorage as a
   JWT plus the user id, decoded client-side to check expiry. */
export function getStoredUser() {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("jwtToken");
  if (!userId || !token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) return null;
  } catch {
    return null;
  }
  return { id: userId, username: username || "" };
}

function persistSession(data) {
  localStorage.setItem("jwtToken", data.token);
  localStorage.setItem("userId", data.data.user._id);
  localStorage.setItem("username", data.data.user.username);
  return { id: data.data.user._id, username: data.data.user.username, email: data.data.user.email };
}

export async function signup(payload) {
  try {
    const { data } = await api.post("/users/signup", payload);
    return persistSession(data);
  } catch (error) {
    throw new Error(errMessage(error, "Signup failed, please try again."));
  }
}

export async function login(email, password) {
  try {
    const { data } = await api.post("/users/login", { email, password });
    return persistSession(data);
  } catch (error) {
    throw new Error(errMessage(error, "Incorrect email or password."));
  }
}

export function logout() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
}

export async function fetchProducts() {
  const { data } = await api.get("/products");
  return data.data.products;
}

export async function createProduct(payload) {
  const { data } = await api.post("/products", payload);
  return data.data.product;
}

export async function fetchMyProducts(ownerId) {
  const { data } = await api.get("/products", { params: { owner: ownerId } });
  return data.data.products;
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
}

export async function fetchUser(id) {
  const { data } = await api.get(`/users/${id}`);
  return data.data.user;
}

export async function toggleLike(userId, productId) {
  const { data } = await api.post(`/users/like/${userId}`, { productId });
  return data.likeditems;
}

export default api;
