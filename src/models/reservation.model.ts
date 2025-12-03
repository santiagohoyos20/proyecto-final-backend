import { Schema, model, Document } from "mongoose";
import { IUser } from "./user.model";
import { IBook } from "./book.model";

export interface IUserBookReservation extends Document {
  user: IUser["_id"];
  book: IBook["_id"];
  reservedAt: Date;
  deliveredAt?: Date;
}

const UserBookReservationSchema = new Schema<IUserBookReservation>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    reservedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

export const UserBookReservationModel = model<IUserBookReservation>(
  "UserBookReservation",
  UserBookReservationSchema
);
