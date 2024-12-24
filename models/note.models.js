import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: Object,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: [
      {
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        permissionLevel: Number,
      },
    ],
    editors: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    commenters: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    viewers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
