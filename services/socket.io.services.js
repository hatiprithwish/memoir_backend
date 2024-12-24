import { Server } from "socket.io";
import Note from "../models/note.models.js";
import User from "../models/user.models.js";

const initializeSocket = (server) => {
  const socket = new Server(server, {
    cors: {
      origin: [
        "https://memoir-frontend.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
      ],
      methods: ["GET", "POST"],
    },
    // path: "/web-socket",
  });

  socket.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("create-note", async (noteId, ownerId) => {
      const existingUser = await User.findOne({ id: ownerId });
      if (!existingUser) {
        throw new Error("User not found");
      }
      const note = await Note.create({
        id: noteId,
        owner: existingUser._id,
        permissions: [{ user: existingUser._id, permissionLevel: 3 }],
      });

      socket.join(noteId);
    });

    socket.on("save-note", async (noteId, data) => {
      const note = await Note.findOneAndUpdate(
        { id: noteId },
        { $set: { content: data } },
        { new: true }
      );
      socket.broadcast.to(noteId).emit("receive-changes", note?.content);
    });

    socket.on("load-note", async (noteId) => {
      const note = await Note.findOne({ id: noteId });
      socket.emit("get-note", note?.content);
    });

    socket.on("send-changes", (noteId, delta) => {
      console.log(delta);
      socket.broadcast.to(noteId).emit("receive-changes", delta);
    });

    socket.on("disconnect", () => {
      console.log("a user disconnected");
    });
  });

  return socket;
};

export default initializeSocket;
