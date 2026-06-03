import apiClient from "./api";

export const dashboardService = {
  async getOverview() {
    const response = await apiClient.get("/api/dashboard/overview");
    return response.data.data;
  },
};
