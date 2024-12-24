import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { Router } from "express";
import {
  getPermissionLevelByUserId,
  getNotesByUser,
  patchNote,
  addOrUpdatePermission,
  getNoteByNoteId,
  askQuestionsToAI,
} from "../controllers/note.controllers.js";

const router = Router();

router
  .route("/")
  .get(ClerkExpressRequireAuth(), getNotesByUser)
  .patch(patchNote);

router.route("/getNoteByNoteId").get(getNoteByNoteId);

router
  .route("/permission")
  .get(getPermissionLevelByUserId)
  .post(addOrUpdatePermission);

router.route("/ask-ai").post(askQuestionsToAI);

export default router;
