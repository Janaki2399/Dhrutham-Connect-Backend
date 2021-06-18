const mongoose = require("mongoose");
const { Schema } = mongoose;
const {isEmail} = require("validator");
require('mongoose-type-url');

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "First name is missing"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is missing"],
  },
  userName: {
    type: String,
    required: [true, "userName is missing"],
    index: { unique: true },
  },
  email: {
    type: String,
    lowercase: true,
    index: { unique: true },
    required: [true, "Email can't be blank"],
    validate:[isEmail,"PLease enter valid email id"]
  },
  password: {
    type: String,
    required: [true, "Password cannot be empty"],
    minlength: 6
  },
  photoUrl:{
    type: mongoose.SchemaTypes.Url,
    default:"https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
  },
  bio: {
    type: String,
    default:"",
  },
  location: {
    type: String,
    default:"",
  },
  websiteLink: {
    type: mongoose.SchemaTypes.Url,
    default:"",
  },
  followers:[{ type: Schema.Types.ObjectId, ref: 'User' }],
  following:[{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } });
userSchema.index({firstName:"text",lastName:"text"})
const User = mongoose.model("User", userSchema);

module.exports = { User };
