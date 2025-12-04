// src/controllers/book.controller.ts
import { Request, Response } from "express";
import { BookModel } from "../models/book.model";

export const createBook = async (req: Request & { user?: any }, res: Response) => {
  try {
    const {
      title,
      author,
      genre,
      publisher,
      publishedAt,
      available,
      active,
    } = req.body;

    // Validación básica
    if (!title || !author) {
      return res.status(400).json({
        message: "El título y el autor son obligatorios.",
      });
    }

    const currentUser = req.user; // viene del middleware
    const canCreateBooks = currentUser.permissions?.canCreateBooks;

    if (!canCreateBooks) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para crear libros",
      });
    }


    const newBook = await BookModel.create({
      title,
      author,
      genre,
      publisher,
      publishedAt,
      available, // si no lo envían → usa el default = true
      active,    // si no lo envían → default = true
    });

    return res.status(201).json({
      message: "Libro creado correctamente.",
      data: newBook,
    });
  } catch (error) {
    console.error("Error creando libro:", error);

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const book = await BookModel.findById(id);

    if (!book) {
      return res.status(404).json({
        message: "Libro no encontrado.",
      });
    }

    return res.status(200).json({
      message: "Libro encontrado.",
      data: book,
    });
  } catch (error) {
    console.error("Error obteniendo libro:", error);

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};