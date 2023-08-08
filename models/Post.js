const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");


const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    require: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  caption: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  text: {
    type: String,
    trim: true,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  comments: [{

    text: String,
    created:{type: Date, default: Date.now},
    userID: {type: ObjectId, ref: "User" }
 
  }],

  
  commentCount: {
    type: Number,
    default: 0,
  },


});




module.exports = mongoose.model("Post", PostSchema);
