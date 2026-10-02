import api from "./api.js";

export const fetchCart = () => api.get("/cart").then((res) => res.data);
export const addToCartApi = (productId, quantity = 1) =>
  api.post("/cart", { productId, quantity }).then((res) => res.data);
export const updateCartItemApi = (productId, quantity) =>
  api.put(`/cart/${productId}`, { quantity }).then((res) => res.data);
export const removeCartItemApi = (productId) =>
  api.delete(`/cart/${productId}`).then((res) => res.data);
