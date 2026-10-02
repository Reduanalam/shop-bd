import api from "./api.js";

export const fetchDashboardStats = () => api.get("/admin/dashboard").then((res) => res.data);

export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api
    .post("/admin/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data);
};

export const uploadProductGalleryImages = (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  return api
    .post("/admin/upload-multiple", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data);
};

export const adminCreateProduct = (data) => api.post("/admin/products", data).then((res) => res.data);
export const adminUpdateProduct = (id, data) => api.put(`/admin/products/${id}`, data).then((res) => res.data);
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`).then((res) => res.data);
export const adminFetchOrders = () => api.get("/admin/orders").then((res) => res.data);
export const adminUpdateOrderStatus = (id, data) => api.put(`/admin/orders/${id}`, data).then((res) => res.data);

export const adminFetchUsers = () => api.get("/admin/users").then((res) => res.data);
export const adminUpdateUserRole = (id, role) => api.put(`/admin/users/${id}`, { role }).then((res) => res.data);
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}`).then((res) => res.data);

export const adminFetchCoupons = () => api.get("/admin/coupons").then((res) => res.data);
export const adminCreateCoupon = (data) => api.post("/admin/coupons", data).then((res) => res.data);
export const adminUpdateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data).then((res) => res.data);
export const adminDeleteCoupon = (id) => api.delete(`/admin/coupons/${id}`).then((res) => res.data);

export const adminFetchBanners = () => api.get("/admin/banners").then((res) => res.data);
export const adminCreateBanner = (data) => api.post("/admin/banners", data).then((res) => res.data);
export const adminUpdateBanner = (id, data) => api.put(`/admin/banners/${id}`, data).then((res) => res.data);
export const adminDeleteBanner = (id) => api.delete(`/admin/banners/${id}`).then((res) => res.data);

export const adminFetchSettings = () => api.get("/admin/settings").then((res) => res.data);
export const adminUpdateSettings = (data) => api.put("/admin/settings", data).then((res) => res.data);
