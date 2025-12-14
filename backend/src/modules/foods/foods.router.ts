import { Router } from "express";
import {
  handleSearchFoods,
  handleListCustomFoods,
  handleCreateCustomFood,
  handleUpdateCustomFood,
  handleDeleteCustomFood,
} from "./foods.controller.js";


export const foodsRouter = Router();

foodsRouter.get("/", handleSearchFoods);

// ✅ custom CRUD
foodsRouter.get("/custom", handleListCustomFoods);
foodsRouter.post("/custom", handleCreateCustomFood);
foodsRouter.put("/custom/:id", handleUpdateCustomFood);
foodsRouter.delete("/custom/:id", handleDeleteCustomFood);
