import { Schema, model, Document } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  genre?: string;
  publisher?: string;
  publishedAt?: Date;
  available: boolean;
  active: boolean;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String },
    publisher: { type: String },
    publishedAt: { type: Date },
    available: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BookModel = model<IBook>("Book", BookSchema);
