import { api } from "./api";

export const getFoods = (params?: any) =>
  api.get("/api/fooditem", params);

export const getFood = (id: number) =>
  api.get(`/api/fooditem/${id}`);

export const createFood = (
  data: any
) =>
  api.post("/api/fooditem", data);

export const updateFood = (
  id: number,
  data: any
) =>
  api.put(`/api/fooditem/${id}`, data);

export const deleteFood = (
  id: number
) =>
  api.delete(`/api/fooditem/${id}`);