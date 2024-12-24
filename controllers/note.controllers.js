import mongoose from "mongoose";
import Note from "../models/note.models.js";
import User from "../models/user.models.js";
import openai from "../services/openAI.services.js";

export const getNotesByUser = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findOne({ id: userId });
    if (!dbUser) {
      throw new Error("User not found in DB");
    }
    const notes = await Note.find({ owner: dbUser._id });
    res.status(200).json(notes);
  } catch (error) {
    console.log(`Error getting notes: ${error.message}`);
    res.status(500).json(error);
  }
};

export const patchNote = async (req, res) => {
  try {
    const { noteId } = req.query;
    const updateFields = req.body;
    if (!noteId) {
      return res.status(400).json({ error: "Note ID is required" });
    }

    const note = await Note.findOne({ id: noteId });
    if (!note) {
      return res.status(404).json(error);
    }

    Object.keys(updateFields).forEach((key) => {
      note[key] = updateFields[key];
    });
    await note.save();

    res.status(200).json({
      message: "Note updated successfully",
      publishStatus: note.isPublic,
    });
  } catch (error) {
    console.error(`Error updating note: ${error.message}`);
    res.status(500).json(error);
  }
};

export const getPermissionLevelByUserId = async (req, res) => {
  try {
    const { noteId, userId } = req.query;
    console.log(noteId, userId);
    if (!noteId || !userId) {
      throw new Error("noteId and userId are not found in query");
    }

    const dbUser = await User.findOne({ id: userId });
    if (!dbUser) {
      throw new Error("User not found in db");
    }

    const note = await Note.findOne({ id: noteId });

    const userInPermissionsArray = note.permissions.find((item) => {
      return item.user._id.equals(dbUser._id);
    });

    return res
      .status(200)
      .json(
        userInPermissionsArray ? userInPermissionsArray.permissionLevel : -1
      );
  } catch (error) {
    console.error(`Error in fetching permission level: ${error.message}`);
    res.status(500).json(error);
  }
};

export const getNoteByNoteId = async (req, res) => {
  try {
    const { noteId, userId } = req.query;
    if (!noteId) {
      return res.status(400).json({ error: "Note ID is required" });
    }
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const dbUser = await User.findOne({ id: userId });
    if (!dbUser) {
      throw new Error("User not found in db");
    }
    const note = await Note.findOne({ id: noteId });
    if (!note) {
      throw new Error("Note not found");
    }
    const userInPermissionsArray = note.permissions.find((item) => {
      return item.user._id.equals(dbUser._id);
    });

    return res.status(200).json({
      note: note,
      userInPermissionsArray: userInPermissionsArray
        ? userInPermissionsArray.permissionLevel
        : -1,
    });
  } catch (error) {
    console.error(`Error fetching note by noteId: ${error.message}`);
    res.status(500).json(error);
  }
};

export const addOrUpdatePermission = async (req, res) => {
  try {
    const { userEmail, permission, noteId } = req.body;
    if (!userEmail || !permission || !noteId) {
      throw new Error("userEmail, permission and noteId are required");
    }

    const existingUser = await User.findOne({ email: userEmail });
    if (!existingUser) return res.status(404).json("User doesn't exist");

    const note = await Note.findOneAndUpdate(
      { id: noteId },
      {
        $push: {
          permissions: {
            user: existingUser,
            permissionLevel:
              permission === "viewer" ? 0 : permission === "commenter" ? 1 : 2,
          },
        },
      },
      { new: true }
    );

    const userInPermissionsArray = note.permissions.some((item) => {
      console.log(item.user._id);
      console.log(existingUser._id);
      return item.user._id.equals(existingUser._id); // Check if user ID matches
    });

    console.log(userInPermissionsArray);

    if (userInPermissionsArray) {
      await Note.findOneAndUpdate(
        {
          _id: note._id,
          "permissions.user": new mongoose.Types.ObjectId(existingUser._id),
        },
        {
          $set: {
            "permissions.$.permissionLevel":
              permission === "viewer" ? 0 : permission === "commenter" ? 1 : 2,
          },
        },
        { upsert: true }
      );
    } else {
      await Note.updateOne(
        { _id: note._id },
        {
          $push: {
            permissions: {
              user: existingUser,
              permissionLevel:
                permission === "viewer"
                  ? 0
                  : permission === "commenter"
                  ? 1
                  : 2,
            },
          },
        },
        { new: true }
      );
    }

    return res.status(200).json("permission added successfully");
  } catch (error) {
    console.error(`Error adding/updating note permission: ${error.message}`);
    res.status(500).json(error);
  }
};

export const askQuestionsToAI = async (req, res) => {
  try {
    const { question } = req.body;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "assistant", content: question }],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: {
        type: "text",
      },
    });

    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
