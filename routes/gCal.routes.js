import { Router } from "express";
import { createGCalEvent } from "../controllers/gCal.controllers.js";

const router = Router();

router.route("/create-event").post(createGCalEvent);

export default router;
