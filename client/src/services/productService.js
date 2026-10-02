import api from "./api.js";

export const fetchProducts = (params) => api.get("/products", { params }).then((res) => res.data);
export const fetchProductById = (id) => api.get(`/products/${id}`).then((res) => res.data);
export const fetchCategories = () => api.get("/categories").then((res) => res.data);
