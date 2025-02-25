import mongoose, { Document, Model } from "mongoose";

interface IUser extends Document {
  username: string;
  name: string;
  image?: string;
  bio?: string;
  threads: mongoose.Types.ObjectId[];
  onboarded: boolean;
  communities: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: String,
  bio: String,
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
  onboarded: {
    type: Boolean,
    default: false,
  },
  communities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
  ],
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export type { IUser };
export default User;
