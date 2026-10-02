import api from "./api.js";

export const fetchSettings = () => api.get("/settings").then((res) => res.data);
export const fetchBanners = () => api.get("/banners").then((res) => res.data);
export const fetchSpinStatus = () => api.get("/spin/status").then((res) => res.data);
export const spinWheelApi = () => api.post("/spin").then((res) => res.data);
