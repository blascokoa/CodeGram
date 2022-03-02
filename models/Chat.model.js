const { Schema, model } = require("mongoose");

chatSchema = new Schema({
  textMessage: {
    type: String,
    required: true,
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
},
{
    timestamps: true,
}
);

const Chat = model("Chat", chatSchema);

module.exports = Chat;
