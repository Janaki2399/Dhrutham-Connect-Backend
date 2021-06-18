const express = require("express");
const loginRouter = require("./routes/login-router.js");
const signupRouter = require("./routes/signup-router.js");
const userRouter = require("./routes/user-router.js");
const postRouter = require("./routes/post-router.js");
const notificationRouter = require("./routes/notification-router.js");
const mongoose = require("mongoose");
const { mongoDBConnection } = require("./db/db.connect.js");
const PORT = process.env.PORT || 5000;
const app = express();
var cors = require("cors");
app.use(cors());
// var bodyParser = require('body-parser')
app.use(express.json());

mongoDBConnection();

// app.use("/videos",videoRouter);

app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/notifications", notificationRouter);

app.get("/", (req, res) => {
  res.json({ text: "hello world" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, errorMessage: "No page found" });
});

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send("Something broke");
});

app.listen(PORT, () => {
  console.log("server started");
});
