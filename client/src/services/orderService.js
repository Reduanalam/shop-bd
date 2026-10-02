import api from "./api.js";

export const placeOrderApi = (data) => api.post("/orders", data).then((res) => res.data);
export const placeDirectOrderApi = (data) => api.post("/orders/direct", data).then((res) => res.data);
export const fetchMyOrders = () => api.get("/orders").then((res) => res.data);
export const fetchOrderById = (id) => api.get(`/orders/${id}`).then((res) => res.data);
