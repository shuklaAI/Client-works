const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api/backend"; // ✅ use rewrite

async function request(endpoint, options = {}) {
  let token = null;

  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(
        localStorage.getItem("techbharat-auth") || "{}"
      );
      token = stored?.state?.token;
    } catch { }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store", // ✅ FIX caching issues
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: "POST", body }),
  put: (url, body) => request(url, { method: "PUT", body }),
  patch: (url, body) => request(url, { method: "PATCH", body }),
  delete: (url) => request(url, { method: "DELETE" }),
};

export default api;

export const productAPI = {
  getAll: () => api.get("/products"),
  getOne: (slug) => api.get(`/products/${slug}`),
};
// Razorpay SDK loader
export function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}