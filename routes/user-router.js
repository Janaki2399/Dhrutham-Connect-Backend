const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { User } = require("../models/user.model");
const { Post } = require("../models/post.model");
const { Notification } = require("../models/notification.model");
const { extend } = require("lodash");

router.use(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, errorMessage: "Unauthorized access" });
  }
});

//Route for user Profile

//Current User Details
router.get("/", async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(
      userId,
      "userName photoUrl followers following"
    ).exec();
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});

router.post("/follow", async (req, res) => {
  try {
    const { userId } = req.user;
    const body = req.body;
    const user = await User.findById(userId);
    const followingUser = await User.findById(body._id);
    user.following.push(body._id);
    followingUser.followers.push(userId);
    await followingUser.save();
    await user.save();
    const notification = new Notification({
      sender: { _id: userId },
      reciever: { _id: body._id },
      action: "Followed",
    });
    await notification.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});

router.post("/unfollow", async (req, res) => {
  const { userId } = req.user;
  const body = req.body;
  const user = await User.findById(userId);
  const followingUser = await User.findById(body._id);
  user.following.pull(body._id);
  followingUser.followers.pull(userId);
  await followingUser.save();
  await user.save();
  res.status(200).json({ success: true });
});

router.get("/:userName/followers", async (req, res) => {
  const { userName } = req.params;
  const followerList = await User.findOne({ userName }, "followers").populate({
    path: "followers",
    select: "firstName lastName userName photoUrl bio",
  });
  res.status(200).json({ success: true, list: followerList.followers });
});

router.get("/:userName/following", async (req, res) => {
  const { userName } = req.params;
  const followingList = await User.findOne({ userName }, "following").populate({
    path: "following",
    select: "firstName lastName userName photoUrl bio",
  });
  res.status(200).json({ success: true, list: followingList.following });
});

router.post("/editProfile", async (req, res) => {
  try {
    const { userId } = req.user;
    const body = req.body;
    const userProfile = await User.findById(userId);
    const updatedProfile = extend(userProfile, body.details);
    await updatedProfile.save();
    res.status(200).json({ success: true, updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});
router.get("/:userName", async (req, res) => {
  const { userName } = req.params;
  const userDetails = await User.findOne({ userName });
  userDetails.password = undefined;
  res.status(200).json({ success: true, userDetails });
});

router.get("/search/query", async (req, res) => {
  try {
    let result = [];
    if (req.query.name) {
      const regex = new RegExp(escapeRegex(req.query.name), "gi");
      result = await User.find(
        {
          $or: [{ firstName: regex }, { lastName: regex }, { userName: regex }],
        },
        "firstName lastName userName bio photoUrl"
      );
    }
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
