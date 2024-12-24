import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { Router } from "express";
import { createNewUser } from "../controllers/user.controllers.js";

const router = Router();

router.route("/").post(ClerkExpressWithAuth(), createNewUser);

export default router;
