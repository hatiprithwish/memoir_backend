import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import dotenv from "dotenv";
import connectToDB from "./config/db.config.js";
import initializeSocket from "./services/socket.io.services.js";

dotenv.config({ path: "./.env.local" });
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

connectToDB();

const server = createServer(app);
server.listen(process.env.PORT, () => {
  console.log(`server listening on: ${process.env.PORT}`);
});
initializeSocket(server);

import noteRouter from "./routes/note.routes.js";
import userRouter from "./routes/user.routes.js";

app.get("/", cors(), (_, res) => res.send("Hello World"));
app.use("/note", noteRouter);
app.use("/user", userRouter);

export default app;
