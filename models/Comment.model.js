const { Schema, model } = require("mongoose");

commentSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Comment = model("Comment", commentSchema);

module.exports = Comment;
