import requests from "./httpServices";

const CategoryServices = {
  getShowingCategory: async () => {
    return requests.get("/category/show");
  },
  getAllCategories: async () => {
    return requests.get("/category/all");
  },
};

export default CategoryServices;
