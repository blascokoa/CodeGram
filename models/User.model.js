const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true, // -> Ideally, should be unique, but its up to you
      required: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    profile_pic: {
      type: String,
      default:
        "https://res.cloudinary.com/alexfurty/image/upload/v1645988410/codegram-project/gkfw2udzaotuesyaqokh.jpg",
    },
    bio: {
      type: String,
      // default: "I love Codegram",
    },
    role: {
      type: String,
      default: "verified",
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      
    ],
    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      
    ],
    password: {
      type: String,
      required: true,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
