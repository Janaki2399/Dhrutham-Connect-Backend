const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User } = require("../models/user.model");

router.post("/", async (req, res) => {
  const body = req.body;
  if (
    !(
      body.firstName &&
      body.lastName &&
      body.userName &&
      body.email &&
      body.password
    )
  ) {
    return res
      .status(401)
      .json({ success: false, errorMessage: "Enter all details" });
  }
  const userExists = await User.findOne({ email: body.email });
  if (userExists) {
    return res.status(409).json({
      success: false,
      errorMessage: "Account already exists.Please Login to continue",
    });
  }
  const userNameAvalilable = await User.findOne({ userName: body.userName });
  if (userNameAvalilable) {
    return res.status(409).json({
      success: false,
      errorMessage: "This username isn't available. Please try another.",
    });
  }
  const user = new User(body);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  let token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
  token = `Bearer ${token}`;

  return res.status(200).json({ success: true, token });
  res.status(200).json({ success: true });
});

module.exports = router;
