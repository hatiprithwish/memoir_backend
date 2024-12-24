import { google } from "googleapis";
import oauth2Client from "../utils/googleAuth.js";
import convertToISO from "../utils/covertToISO.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

const TIMEZONE = "Asia/Kolkata";
const TIMEZONE_OFFSET = "-07:00";
const PROVIDER = "oauth_google";

export const createGCalEvent = async (req, res) => {
  try {
    const { userId, title, description, date, startTime, endTime } = req.body;
    if (!userId || !title || !description || !date || !startTime || !endTime) {
      throw new Error("Request body does not contain all required fields");
    }

    const accessTokenResponse = await clerkClient.users.getUserOauthAccessToken(
      userId,
      PROVIDER
    );

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: convertToISO(date, startTime, TIMEZONE_OFFSET),
        timeZone: TIMEZONE,
      },
      end: {
        dateTime: convertToISO(date, endTime, TIMEZONE_OFFSET),
        timeZone: TIMEZONE,
      },
    };

    oauth2Client.setCredentials({
      access_token: accessTokenResponse.data[0].token,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    await calendar.events.insert({
      auth: oauth2Client,
      calendarId: "primary",
      resource: event,
    });

    res.status(200).json({ message: "Event created" });
  } catch (error) {
    console.error("Error creating event:", error.message);
    res
      .status(500)
      .json({ message: "Error creating event", error: error.message });
  }
};
