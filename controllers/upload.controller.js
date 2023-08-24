const fs = require("fs");
const path = require("path");
const multer = require("multer");
const UserModel = require("../models/user.model");

// Configuration de Multer pour gérer les fichiers d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads/profiles"); // Dossier de destination des images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extname = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extname);
  },
});

const upload = multer({ storage: storage }).single("profileImage"); // Nom du champ de fichier dans le formulaire

module.exports.updateProfilePicture = async (req, res) => {
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

    const userId = req.user._id; // Supposons que vous ayez les informations de l'utilisateur via le middleware d'authentification

    // Vérifier si l'utilisateur a déjà une photo de profil
    const existingUser = await UserModel.findById(userId);
    if (
      existingUser.picture !==
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    ) {
      // Supprimer l'ancienne photo de profil du dossier local
      const oldImagePath = path.join(__dirname, `../${existingUser.picture}`);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Mettre à jour la nouvelle photo de profil dans la base de données
    existingUser.picture = req.file.path.replace(/\\/g, "/"); // Chemin de l'image pour la base de données
    await existingUser.save();

    res
      .status(200)
      .json({ message: "Photo de profil mise à jour avec succès." });
  });
};
