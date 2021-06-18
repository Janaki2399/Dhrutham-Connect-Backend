const mongoose = require("mongoose");
require("dotenv").config();
async function mongoDBConnection() {
  try {
    await mongoose.connect(process.env.CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = { mongoDBConnection };
