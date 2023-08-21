const PostModel = require("../models/post.model");
const userModel = require("../models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports.readPost = async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
};

module.exports.createPost = async (req, res) => {
  try {
    const { postID, message, comments, likers, video } = req.body;

    const newPost = new PostModel({
      postID,
      message,
      comments,
      likers,
      video,
    });

    const savedPost = await newPost.save();

    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while saving the post." });
  }
};

module.exports.updatePost = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }
  } else {
    res.status(404).json({ message: "Post not found." });
  }
};

module.exports.deletePost = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      await PostModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Post deleted successfully." });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }
  } else {
    res.status(404).json({ message: "Post not found." });
  }
};

module.exports.likePost = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      const post = await PostModel.findById(req.params.id);
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: { likers: req.body.id },
        },
        { new: true }
      );

      await userModel.findByIdAndUpdate(
        req.body.id,
        {
          $push: { likes: req.params.id },
        },
        { new: true }
      );

      res.status(200).json(updatedPost);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }
  } else {
    res.status(404).json({ message: "Post not found." });
  }
};

module.exports.unlikePost = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      const post = await PostModel.findById(req.params.id);
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { likers: req.body.id },
        },
        { new: true }
      );
      await userModel.findByIdAndUpdate(
        req.body.id,
        {
          $pull: { likes: req.params.id },
        },
        { new: true }
      );
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }
  }
};
