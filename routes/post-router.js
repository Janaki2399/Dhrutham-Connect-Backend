const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { User } = require("../models/user.model");
const { Post } = require("../models/post.model");
const { Notification } = require("../models/notification.model");

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

router.get("/:userName", async (req, res) => {
  try {
    const { userName } = req.params;
    const userId = await User.findOne({ userName }, "userId");
    console.log(userId);
    const response = await Post.find({ userId }).populate({
      path: "userId",
      select: "firstName lastName userName bio photoUrl",
    });
    res.status(200).json({ success: true, postList: response });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { userId } = req.user;
    const followingUsers = await User.findById(userId, "following").exec();

    const response = await Post.find({
      userId: { $in: [...followingUsers.following, userId] },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "firstName lastName userName bio photoUrl",
      })
      .limit(30);

    res.status(200).json({ success: true, postList: response });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { userId } = req.user;
    const body = req.body;
    const post = new Post({
      userId,
      text: body.text,
    });

    await post.save();
    const postPopulated = await post
      .populate({
        path: "userId",
        select: "firstName lastName userName bio photoUrl",
      })
      .execPopulate();

    res.status(200).json({ success: true, post: postPopulated });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "add post error",
      errorMessage: error.message,
    });
  }
});

router.post("/like/:postId", async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    post.likes.push(userId);
    await post.save();
    if (userId.toString() !== post.userId.toString()) {
      const notification = new Notification({
        sender: { _id: userId },
        reciever: { _id: post.userId },
        action: "Liked",
        postId: { _id: postId },
      });
      await notification.save();
    }
    res.status(200).json({ success: true, userId, postId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});
router.post("/unlike/:postId", async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    post.likes.pull(userId);
    await post.save();
    res.status(200).json({ success: true, userId, postId });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});
module.exports = router;
