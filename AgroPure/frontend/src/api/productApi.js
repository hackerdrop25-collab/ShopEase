import api from "./axios";

// Get products
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });
  return response.data;
};

// Get single product
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Create product (farmer/admin)
export const createProductApi = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

// Update product
export const updateProductApi = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Delete product
export const deleteProductApi = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
