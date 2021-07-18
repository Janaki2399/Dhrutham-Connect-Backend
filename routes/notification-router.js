const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { User } = require("../models/user.model");
const { Post } = require("../models/post.model");
const { Notification } = require("../models/notification.model");
// secret="IyUycYh3KHp7gy2ASaOq7bia/X5mwYfj/GlIUQcILrjJek1t7pmRX5q4Im1EZWJek3ZGdDrPZGCHa2F9fPJikeIngav4vhIWRiBLL8GfSWpVBYbyZ6Gw9FMstKsPMdhDj6lI1qEKuiovGPzYKngMrH7vYzV6a44vm+AqEt47h0ecmB3uKP3kWVH0tgj5mCvzxqoNRTvROGGUXSIbfJbBkYEAEpqHITtRoiVw1Xd6gLJnoDl2mGYYJxDOnysqJL574BrNmf01xQrexqCsx0Q6sJ75rabjtlS1y77gFErfxWH5aJvyJgJH4KI6+UZIKqdaqhL6CSVNpJ3cu+HBYumWPg=="

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

router.get("/", async (req, res) => {
  try {
    const { userId } = req.user;
    const notificationList = await Notification.find({ reciever: userId })
      .populate({ path: "sender ", select: "firstName lastName photoUrl" })
      .populate({ path: "postId", select: "text" });

    res.status(200).json({ success: true, notificationList });
  } catch (error) {
    console.error(log);
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});

module.exports = router;
