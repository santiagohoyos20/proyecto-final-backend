import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // Validación mínima
    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "name, email y password son obligatorios",
      });
    }

    // Verificar si el correo ya existe
    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(409).json({
        ok: false,
        message: "El correo ya está registrado",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword, // Si quieres, puedo agregarte hashing con bcrypt
    });

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        active: newUser.active,
        permissions: {
          canCreateBooks: newUser.canCreateBooks,
          canEditBooks: newUser.canEditBooks,
          canDisableBooks: newUser.canDisableBooks,
          canEditUsers: newUser.canEditUsers,
          canDisableUsers: newUser.canDisableUsers,
        },
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "email y password son obligatorios",
      });
    }

    // Buscar usuario
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        ok: false,
        message: "Tu cuenta está desactivada. Contacta al administrador.",
      });
    }

    // Validar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        ok: false,
        message: "Contraseña incorrecta",
      });
    }

    // Crear Token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        permissions: {
          canCreateBooks: user.canCreateBooks,
          canEditBooks: user.canEditBooks,
          canDisableBooks: user.canDisableBooks,
          canEditUsers: user.canEditUsers,
          canDisableUsers: user.canDisableUsers,
        },
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      ok: true,
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const getUserById = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    const { id } = req.params;

    // Solo el usuario dueño del perfil o alguien con permisos puede ver info
    const currentUser = req.user;

    const isOwner = currentUser.id === id;
    const canReadOtherUsers = currentUser.permissions?.canEditUsers;

    if (!isOwner && !canReadOtherUsers) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para ver este usuario",
      });
    }

    // Buscar el usuario
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      ok: true,
      user,
    });

  } catch (error) {
    console.error("Error en getUserById:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const updateUser = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    const { id } = req.params;

    const currentUser = req.user; // viene del middleware
    const isOwner = currentUser.id === id;
    const canEditUsers = currentUser.permissions?.canEditUsers;

    // Si no es dueño ni tiene permisos administrativos
    if (!isOwner && !canEditUsers) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para editar este usuario",
      });
    }

    const {
      name,
      email,
      password,
      canCreateBooks,
      canEditBooks,
      canDisableBooks,
      canEditUsers: editUsersPermission,
      canDisableUsers,
    } = req.body;

    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // si mandan contraseña, se vuelve a hashear
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (canCreateBooks !== undefined) updateData.canCreateBooks = canCreateBooks;
    if (canEditBooks !== undefined) updateData.canEditBooks = canEditBooks;
    if (canDisableBooks !== undefined) updateData.canDisableBooks = canDisableBooks;
    if (editUsersPermission !== undefined) updateData.canEditUsers = editUsersPermission;
    if (canDisableUsers !== undefined) updateData.canDisableUsers = canDisableUsers;


    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      ok: true,
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error en updateUser:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const deleteUser = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (currentUser.id !== id && currentUser.canDisableUsers !== true) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para eliminar usuarios",
      });
    }

    const deletedUser = await UserModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!deletedUser) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      ok: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error eliminando usuario",
      error,
    });
  }
};
