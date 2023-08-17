const UserModel = require("../models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({
      message:
        "Une erreur s'est produite lors de la récupération des utilisateurs.",
    });
  }
};

module.exports.userInfo = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({
      message:
        "Une erreur s'est produite lors de la récupération de l'utilisateur.",
    });
  }
};

/*module.exports.updateUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res.status(500).json({
      message:
        "Une erreur s'est produite lors de la mise à jour de l'utilisateur.",
    });
  }
};*/
module.exports.updateUser = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            biographie: req.body.biographie,
          },
        },
        { new: true }
      );
      res.status(200).json(user);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      res.status(500).json({
        message:
          "Une erreur s'est produite lors de la mise à jour de l'utilisateur.",
      });
    }
  } else {
    res.status(404).json({ message: "Utilisateur non trouvé" });
  }
};

module.exports.deleteUser = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    try {
      await UserModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      res.status(500).json({
        message:
          "Une erreur s'est produite lors de la suppression de l'utilisateur.",
      });
    }
  }
};
