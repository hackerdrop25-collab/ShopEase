import api from "./axios";

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/upload/product-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
