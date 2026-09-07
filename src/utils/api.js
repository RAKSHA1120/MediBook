import { getCurrentUser } from "./auth";

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:5107/api";
  return url.replace(/\/+$/, "");
};

const BASE_URL = getBaseUrl();

const buildUrl = (endpoint) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${BASE_URL}${path}`;
};

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
      const user = getCurrentUser();
      const headers = { "Content-Type": "application/json" };
      if (user) {
        headers["X-User-Role"] = user.role;
        headers["X-User-Id"] = user.id;
      }
      let response = await fetch(buildUrl(endpoint), {
        method: "GET",
        headers
      });
      if (response.status === 404 && endpoint.includes("patient-hospitals")) {
        const altEndpoint = endpoint.replace("patient-hospitals", "PatientHospitals");
        const altResponse = await fetch(`${BASE_URL}${altEndpoint}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (altResponse.ok) {
          response = altResponse;
        }
      }
      return await handleResponse(response);
    } catch (error) {
      console.error(`API GET ${endpoint} error:`, error);
      return { success: false, error: "Network error or API offline" };
    }
  },

  post: async (endpoint, body) => {
    debugger;
    try {
      const user = getCurrentUser();
      const headers = { "Content-Type": "application/json" };
      if (user) {
        headers["X-User-Role"] = user.role;
        headers["X-User-Id"] = user.id;
      }
      let response = await fetch(buildUrl(endpoint), {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      if (response.status === 404 && endpoint.includes("patient-hospitals")) {
        const altEndpoint = endpoint.replace("patient-hospitals", "PatientHospitals");
        const altResponse = await fetch(`${BASE_URL}${altEndpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (altResponse.ok) {
          response = altResponse;
        }
      }
      return await handleResponse(response);
    } catch (error) {
      console.error(`API POST ${endpoint} error:`, error);
      return { success: false, error: "Network error or API offline" };
    }
  },

  put: async (endpoint, body) => {
    try {
      const user = getCurrentUser();
      const headers = { "Content-Type": "application/json" };
      if (user) {
        headers["X-User-Role"] = user.role;
        headers["X-User-Id"] = user.id;
      }
      const response = await fetch(buildUrl(endpoint), {
        method: "PUT",
        headers,
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
      const user = getCurrentUser();
      const headers = { "Content-Type": "application/json" };
      if (user) {
        headers["X-User-Role"] = user.role;
        headers["X-User-Id"] = user.id;
      }
      const response = await fetch(buildUrl(endpoint), {
        method: "DELETE",
        headers
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`API DELETE ${endpoint} error:`, error);
      return { success: false, error: "Network error or API offline" };
    }
  }
};
