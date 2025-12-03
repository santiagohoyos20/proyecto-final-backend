import { Router } from "express";
import { registerUser, loginUser, getUserById, updateUser, deleteUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/users/:id", authMiddleware, getUserById);
userRoutes.put("/users/:id", authMiddleware, updateUser);
userRoutes.delete("/users/:id", authMiddleware, deleteUser);

export default userRoutes;