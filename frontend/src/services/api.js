import { products, salesData, topProducts, categoryData, aiSuggestions, demandTrends } from '../data/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace("http://localhost:", "http://127.0.0.1:").replace("https://localhost:", "https://127.0.0.1:");

console.log("[api] using API_URL:", API_URL);

// Helper to build full URL and log requests
const buildUrl = (path) => {
  const base = API_URL.replace(/\/$/, "");
  const full = path.startsWith("/") ? base + path : base + "/" + path;
  console.log("[api] request ->", full);
  return full;
};

// Wrapper around fetch that returns parsed JSON and better errors
const fetchJson = async (path, options = {}) => {
  const url = buildUrl(path);
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

    if (!res.ok) {
      const errMsg =
        (data && data.detail) ||
        (data && data.error) ||
        (data && data.message) ||
        `HTTP ${res.status}`;

      const error = new Error(errMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[api] fetch error (${url}):`, err);
    if (err && err.name === "Error" && err.message) {
      throw err;
    }
    throw new Error(`Failed to fetch ${url}: ${err.message}`);
  }
};

export default API_URL;


export const api = {
  // auth: {
  //   login: async (email, password) => {
  //     await delay(800);
  //     if (email && password.length >= 6) {
  //       return { success: true, user: { name: "Arjun Sharma", email, shop: "Sharma Provisions" } };
  //     }
  //     throw new Error("Invalid credentials");
  //   },
  //   signup: async (name, email, password) => {
  //     await delay(1000);
  //     if (name && email && password.length >= 6) {
  //       return { success: true, user: { name, email, shop: `${name.split(' ')[0]}'s Store` } };
  //     }
  //     throw new Error("Signup failed. Please check your details.");
  //   },
  // },
  auth: {
    login: async (email, password) => {
      const data = await fetchJson('/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const user = data?.user || {
        email,
        name: email.split("@")[0],
        role: "customer"
      };

      // Store token and user data
      if (data?.token) localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      return { ...data, user };
    },

    signup: async (name, email, password) => {
      return await fetchJson('/auth/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
    },

    // Validate current token and get user data
    validateToken: async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return null;
      }

      try {
        const data = await fetchJson('/auth/me', {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!data) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return null;
        }

        localStorage.setItem("user", JSON.stringify(data));
        return data;
      } catch (error) {
        console.error("Token validation error:", error);
        return null;
      }
    },

    // Logout
    logout: async () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { success: true };
    }
  },

  mlPredictions: {
    getPredictions: async () => {
      const token = localStorage.getItem("token");

      return await fetchJson('/ml-predictions/', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  },

 products: {
  getAll: async () => {
    const token = localStorage.getItem("token");

    return await fetchJson('/products', { headers: { "Authorization": `Bearer ${token}` } });
  },

  add: async (product) => {
    const token = localStorage.getItem("token");

    return await fetchJson('/products', {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(product)
    });
  },

  update: async (productId, product) => {
    const token = localStorage.getItem("token");

    return await fetchJson(`/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(product)
    });
  },

  delete: async (productId) => {
    const token = localStorage.getItem("token");

    return await fetchJson(`/products/${productId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
  }
},

//   analytics: {
//     getSales: async () => { await delay(500); return salesData; },
//     getTopProducts: async () => { await delay(400); return topProducts; },
//     getCategoryDistribution: async () => { await delay(400); return categoryData; },
//     getAISuggestions: async () => { await delay(600); return aiSuggestions; },
//     getDemandTrends: async () => { await delay(500); return demandTrends; },
//     getSummary: async () => {

//   const token = localStorage.getItem("token");

//   const res = await fetch(
//     "${API_URL}/analytics/",
//     {
//       headers: {
//         "Authorization": `Bearer ${token}`
//       }
//     }
//   );

//   return await res.json();
// },
//   },
analytics: {

  getSales: async () => {
    await delay(500);
    return salesData;
  },

  getTopProducts: async () => {
    await delay(400);
    return topProducts;
  },
  getAnalytics: async () => {

  const token = localStorage.getItem("token");

  return await fetchJson('/analytics/', { headers: { Authorization: `Bearer ${token}` } });
},

  getCategoryDistribution: async () => {
    await delay(400);
    return categoryData;
  },

  getAISuggestions: async () => {
    await delay(600);
    return aiSuggestions;
  },

  getDemandTrends: async () => {
    await delay(500);
    return demandTrends;
  },

  getSummary: async () => {

    const token = localStorage.getItem("token");

    return await fetchJson('/analytics/', { headers: { "Authorization": `Bearer ${token}` } });
  },

},
aiSuggestions: {

  getSuggestions: async () => {

    const token = localStorage.getItem("token");

    return await fetchJson('/ai-suggestions/', { headers: { "Authorization": `Bearer ${token}` } });
  }

},

  billing: {
    getBills: async () => {

  const token = localStorage.getItem("token");

  return await fetchJson('/billing/', { headers: { "Authorization": `Bearer ${token}` } });
},

  generateBill: async (billData) => {

    const token = localStorage.getItem("token");

    const data = await fetchJson('/billing', {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(billData)
    });

    return data;
  },

},
};
// const token = localStorage.getItem("token");

// fetch("${API_URL}/protected-route", {
//   headers: {
//     "Authorization": `Bearer ${token}`
//   }
// });