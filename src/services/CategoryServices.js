import requests from "./httpServices";

const CategoryServices = {
  getShowingCategory: async () => {
    return requests.get("/category/show");
  },
  getAllCategories: async () => {
    // Use nested categories route to return parent->children tree
    return requests.get("/category");
  },
};

export default CategoryServices;
