const PostModel = require("../models/post.model");
const userModel = require("../models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;
const multer = require("multer");

module.exports.readPost = async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
};

//Controlleur pour la création d'un post
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../frontend/public/uploads/posts"); // Spécifiez le dossier de destination où les images seront stockées.
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage }).single("picture");

module.exports.createPost = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // Gérer les erreurs de Multer
      return res.status(500).json({
        message: "Une erreur est survenue lors du téléchargement de l'image.",
      });
    } else if (err) {
      // Gérer d'autres erreurs
      return res.status(500).json({
        message: "Une erreur est survenue lors du traitement de l'image.",
      });
    }

    try {
      const { posterId, message, comments, likers, video } = req.body;

      // Vérifiez si un fichier image a été téléchargé
      let picture = ""; // Initialisez la variable picture ici

      if (req.file) {
        picture = req.file.path.replace(/\\/g, "/"); // Chemin de l'image sur le disque
      }

      const newPost = new PostModel({
        posterId,
        message,
        comments,
        likers,
        picture, // Utilisez la variable picture pour enregistrer le chemin de l'image
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
  });
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

module.exports.commentPost = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      const post = await PostModel.findById(req.params.id); // Id du post
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: {
              commenterId: req.body.commenterId,
              commenterPseudo: req.body.commenterPseudo,
              comment: req.body.comment,
              time: Date.now(),
            },
          },
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

module.exports.editComment = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      const postId = req.params.id; // Id du post

      const commentId = req.body.commentId; // Id du commentaire à éditer

      const updatedPost = await PostModel.findOneAndUpdate(
        { _id: postId, "comments._id": commentId }, // Identifier le commentaire par son indice
        {
          $set: {
            "comments.$.comment": req.body.comment, // Mettre à jour le texte du commentaire
            "comments.$.time": Date.now(), // Mettre à jour le timestamp
          },
        },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ message: "Post or comment not found." });
      }

      res.status(200).json(updatedPost);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }
  }
};

module.exports.deleteComment = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      const postId = req.params.id; // Id du post

      const commentId = req.body.commentId; // Id du commentaire à éditer

      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        {
          $pull: {
            comments: { _id: commentId }, // Supprimer le commentaire par son indice
          },
        },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ message: "Post or comment not found." });
      }

      res.status(200).json(updatedPost);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while processing your request." });
    }
  }
};
