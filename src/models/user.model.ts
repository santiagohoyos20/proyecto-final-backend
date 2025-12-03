import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  active: boolean;

  canCreateBooks: boolean;
  canEditBooks: boolean;
  canDisableBooks: boolean;
  canEditUsers: boolean;
  canDisableUsers: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    active: { type: Boolean, default: true },

    canCreateBooks: { type: Boolean, default: false },
    canEditBooks: { type: Boolean, default: false },
    canDisableBooks: { type: Boolean, default: false },
    canEditUsers: { type: Boolean, default: false },
    canDisableUsers: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", UserSchema);
