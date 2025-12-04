import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createBook, deleteBook, getBookById, updateBook } from "../controllers/book.controller";

const bookRoutes = Router();

bookRoutes.post("/create", authMiddleware, createBook);
bookRoutes.get("/:id", getBookById);
bookRoutes.put("/:id", authMiddleware, updateBook);
bookRoutes.delete("/:id", authMiddleware, deleteBook);

export default bookRoutes;