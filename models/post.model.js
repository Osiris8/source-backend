const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    postID: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    comments: {
      type: [
        {
          commenterId: String,
          commenterPseudo: String,
          comment: String,
          time: Date,
        },
      ],
      required: true,
    },
    likers: {
      type: [String],
      required: true,
    },

    picture: {
      type: String,
    },
    video: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", PostSchema);
