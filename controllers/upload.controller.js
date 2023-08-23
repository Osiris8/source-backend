const multer = require("multer");
const fs = require("fs");
const path = require("path");
const UserModel = require("../models/user.model");

// Configuration de multer pour gérer le téléchargement d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads/profiles"); // Spécifiez le répertoire où les images seront téléchargées
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + extension); // Nom du fichier d'image après téléchargement
  },
});

const upload = multer({ storage: storage });

// Contrôleur pour télécharger la photo de profil d'un utilisateur
const uploadProfileImage = upload.single("profileImage"); // "profileImage" doit correspondre au champ de téléchargement dans le formulaire

const updateProfileImage = async (req, res) => {
  const userId = req.params.id; // Supposons que l'ID de l'utilisateur soit passé en tant que paramètre d'URL

  try {
    // Vérifier si l'utilisateur existe
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.picture) {
      const oldImagePath = path.join(__dirname, user.picture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log("je retire l'image existante");
      } else {
        console.log("je ne retire pas l'image existante");
      }
      console.log(oldImagePath);
    }

    // Mettre à jour l'URL de la photo de profil avec le chemin de l'image téléchargée
    user.picture = req.file.path; // req.file contient les informations sur le fichier téléchargé
    await user.save();

    res
      .status(200)
      .json({ message: "Photo de profil mise à jour avec succès", user: user });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la photo de profil",
      error: error.message,
    });
  }
};

module.exports = {
  uploadProfileImage,
  updateProfileImage,
};
