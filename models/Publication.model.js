const { Schema, model } = require("mongoose");

const publicationSchema = new Schema(
  {
    description: {
      type: String,
    },
    public: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      enum: ["html", "css", "js", "py"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Publication = model("Publication", publicationSchema);

module.exports = Publication;
