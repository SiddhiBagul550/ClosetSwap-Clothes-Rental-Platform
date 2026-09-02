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
  const accountType = localStorage.getItem("accountType");
  const verificationStatus = localStorage.getItem("verificationStatus");
  const emailVerified = localStorage.getItem("emailVerified");
  const token = localStorage.getItem("jwtToken");
  if (!userId || !token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) return null;
  } catch {
    return null;
  }
  return {
    id: userId,
    username: username || "",
    accountType: accountType || "individual",
    verificationStatus: verificationStatus || "verified",
    emailVerified: emailVerified === "true",
  };
}

function persistSession(data) {
  const user = data.data.user;
  localStorage.setItem("jwtToken", data.token);
  localStorage.setItem("userId", user._id);
  localStorage.setItem("username", user.username);
  localStorage.setItem("accountType", user.accountType);
  localStorage.setItem("verificationStatus", user.verificationStatus);
  localStorage.setItem("emailVerified", String(!!user.emailVerified));
  return {
    id: user._id,
    username: user.username,
    accountType: user.accountType,
    verificationStatus: user.verificationStatus,
    emailVerified: !!user.emailVerified,
    email: user.email,
    contactNumber: user.contactNumber,
  };
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

export async function verifyEmail(token) {
  const { data } = await api.post(`/users/verify-email/${token}`);
  return data;
}

export async function resendVerificationEmail() {
  try {
    const { data } = await api.post("/users/resend-verification");
    return data;
  } catch (error) {
    throw new Error(errMessage(error, "Couldn't resend the verification email, please try again."));
  }
}

/* No RESEND_API_KEY is set on the backend yet, the code isn't actually
   delivered - it's echoed back as devResetCode outside production so this is
   testable end to end. See authController.forgotPassword. */
export async function forgotPassword(email) {
  try {
    const { data } = await api.post("/users/forgot-password", { email });
    return data.devResetCode || null;
  } catch (error) {
    throw new Error(errMessage(error, "Couldn't request a reset code, please try again."));
  }
}

export async function resetPassword(email, code, password, passwordConfirm) {
  try {
    const { data } = await api.post("/users/reset-password", { email, code, password, passwordConfirm });
    return persistSession(data);
  } catch (error) {
    throw new Error(errMessage(error, "That code is invalid or has expired."));
  }
}

export function logout() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("accountType");
  localStorage.removeItem("verificationStatus");
  localStorage.removeItem("emailVerified");
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

export async function updateProduct(id, payload) {
  try {
    const { data } = await api.patch(`/products/${id}`, payload);
    return data.data.product;
  } catch (error) {
    throw new Error(errMessage(error, "Couldn't update that listing, please try again."));
  }
}

export async function fetchUser(id) {
  const { data } = await api.get(`/users/${id}`);
  return data.data.user;
}

export async function toggleLike(userId, productId) {
  const { data } = await api.post(`/users/like/${userId}`, { productId });
  return data.likeditems;
}

export async function fetchAvailability(productId) {
  const { data } = await api.get(`/bookings/availability/${productId}`);
  return data.data; // { units, bookings }
}

export async function createBooking(payload) {
  try {
    const { data } = await api.post("/bookings", payload);
    return data.data.booking;
  } catch (error) {
    throw new Error(errMessage(error, "Couldn't send that request, please try again."));
  }
}

export async function fetchMyBookings() {
  const { data } = await api.get("/bookings/mine");
  return data.data.bookings;
}

export async function fetchReceivedBookings() {
  const { data } = await api.get("/bookings/received");
  return data.data.bookings;
}

export async function acceptBooking(id) {
  const { data } = await api.patch(`/bookings/${id}/accept`);
  return data.data.booking;
}

export async function declineBooking(id) {
  const { data } = await api.patch(`/bookings/${id}/decline`);
  return data.data.booking;
}

export async function cancelBooking(id) {
  const { data } = await api.patch(`/bookings/${id}/cancel`);
  return data.data.booking;
}

export async function fetchThreads() {
  const { data } = await api.get("/messages/threads");
  return data.data.threads;
}

export async function fetchMessages(bookingId) {
  const { data } = await api.get(`/messages/${bookingId}`);
  return data.data.messages;
}

export async function sendMessage(bookingId, text) {
  try {
    const { data } = await api.post(`/messages/${bookingId}`, { text });
    return data.data.message;
  } catch (error) {
    throw new Error(errMessage(error, "Couldn't send that message, please try again."));
  }
}

export default api;
