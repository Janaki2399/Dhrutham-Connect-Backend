const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
  sender:{ type: Schema.Types.ObjectId, ref: 'User',
  required:true},
  reciever: {
    type: Schema.Types.ObjectId, ref: "User",
    required: true
  },
  action:{
    type:String,
    required:true
  },
  postId: {
    type: Schema.Types.ObjectId, ref: "Post"}
  },{timestamps:true});
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };