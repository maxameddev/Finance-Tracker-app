// Central API client: base URL, auth token, and one function per endpoint.
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },
  save: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors; // [{ field, message }] from the backend validator
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = auth.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const isForm = body instanceof FormData;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?", 0);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Expired/invalid token on a protected route -> log out.
    if (res.status === 401 && token) {
      auth.clear();
      window.dispatchEvent(new Event("auth:logout"));
    }
    throw new ApiError(data.message || `Request failed (${res.status})`, res.status, data.errors);
  }

  return data;
}

// Categories are a static list on the backend, so fetch once per session.
let categoriesCache = null;

export const api = {
  // Auth
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: { name, email, password } }),
  getProfile: () => request("/auth/profile").then((d) => d.user),
  uploadProfilePicture: (file) => {
    const form = new FormData();
    form.append("profilePicture", file);
    return request("/auth/profile-picture", { method: "POST", body: form });
  },

  // Transactions
  getTransactions: () => request("/transactions").then((d) => d.transactions),
  createTransaction: (tx) => request("/transactions", { method: "POST", body: tx }),
  updateTransaction: (id, tx) => request(`/transactions/${id}`, { method: "PUT", body: tx }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: "DELETE" }),
  getSummary: () => request("/transactions/monthly-summary").then((d) => d.summary),

  // Categories
  getCategories: async () => {
    if (!categoriesCache) {
      categoriesCache = await request("/categories").then((d) => d.categories);
    }
    return categoriesCache;
  },
};
