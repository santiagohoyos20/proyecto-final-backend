import { Router } from "express";
import { registerUser, loginUser, getUserById, updateUser, deleteUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createBook, getBookById } from "../controllers/book.controller";

const bookRoutes = Router();

bookRoutes.post("/create", authMiddleware, createBook);
bookRoutes.get("/:id", getBookById);

export default bookRoutes;