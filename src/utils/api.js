const BASE_URL = "http://localhost:5107/api";

const handleResponse = async (response) => {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = (data && data.message) || response.statusText || "An error occurred";
    return { success: false, error, data };
  }

  return { success: true, data };
};

export const api = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`API GET ${endpoint} error:`, error);
      return { success: false, error: "Network error or API offline" };
    }
  },

  post: async (endpoint, body) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`API POST ${endpoint} error:`, error);
      return { success: false, error: "Network error or API offline" };
    }
  },

  put: async (endpoint, body) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`API PUT ${endpoint} error:`, error);
      return { success: false, error: "Network error or API offline" };
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`API DELETE ${endpoint} error:`, error);
      return { success: false, error: "Network error or API offline" };
    }
  }
};
