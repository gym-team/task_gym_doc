import axios from "axios";
import apiClient from "@/lib/api-client";

function extractErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Something went wrong.";
  }

  const data = error.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.details) {
    return data.details;
  }

  if (data?.title) {
    return data.title;
  }

  if (Array.isArray(data?.errors)) {
    return data.errors.join("\n");
  }

  if (typeof data?.errors === "object") {
    const messages = Object.values(data.errors)
      .flat()
      .filter(Boolean);

    if (messages.length) {
      return messages.join("\n");
    }
  }

  return error.message || "Request failed.";
}

export const api = {
  get: async <T>(url: string, params?: any): Promise<T> => {
    try {
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  post: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.post(url, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  put: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.put(url, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  patch: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.patch(url, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  delete: async <T>(url: string): Promise<T> => {
    try {
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};

apiClient.interceptors.request.use((config) => {
  console.log("URL =", config.url);
  console.log("METHOD =", config.method);
  console.log("DATA =", config.data);

  return config;
});