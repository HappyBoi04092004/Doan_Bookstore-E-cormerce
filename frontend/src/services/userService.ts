import api from "./api";

export const userService = {
  // Admin routes
  async getUsers(search: string = "", page: number = 1, limit: number = 10) {
    const response = await api.get("/api/users", {
      params: { search, page, limit },
    });
    return response.data; // { success, data: { users, total, page, limit } }
  },

  async getUserById(id: number) {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  async createUser(data: any) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.post("/api/users", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },

  async updateUser(id: number, data: any) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.put(`/api/users/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },

  async deleteUser(id: number) {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  // Profile update
  async updateProfile(data: { name?: string; email?: string; password?: string; image?: any }) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const val = (data as any)[key];
      if (val !== undefined && val !== null) {
        formData.append(key, val);
      }
    });
    const response = await api.put("/api/users/me", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },
};
