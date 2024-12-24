import User from "../models/user.models.js";

export const createNewUser = async (req, res) => {
  const { id, email, fullName, avatar, username } = req.body;

  try {
    let user = await User.findOne({ id });

    if (!user) {
      user = new User({ id, email, fullName, avatar, username });
      await user.save();
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log("error while creating user -> " + error.message);
    res
      .status(500)
      .json({ message: "Server error while creating user", error });
  }
};
