const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");
const userModel = require("../models/user.model"); // Assurez-vous de spécifier le bon chemin

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads/profiles"); // Répertoire où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage: storage });

// Contrôleur pour la modification de la photo de profil
const updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.params.id; // Supposons que vous passez l'ID utilisateur dans les paramètres d'URL
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ message: "L'utilisateur n'a pas été trouvé." });
    }

    // Vérifier si l'utilisateur a déjà une photo de profil
    if (user.picture) {
      // Supprimer l'ancienne photo de profil du disque local
      try {
        await fs.unlink(user.picture);
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de l'ancienne photo :",
          error
        );
      }
    }

    // Traitement de la mise à jour de la photo de profil
    upload.single("profilePhoto")(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          message:
            "Une erreur s'est produite lors du téléchargement du fichier.",
        });
      } else if (err) {
        return res
          .status(500)
          .json({ message: "Une erreur interne s'est produite." });
      }

      // Mise à jour de l'URL de la photo de profil dans le modèle de l'utilisateur
      if (req.file) {
        user.picture = req.file.path; // Mise à jour de l'URL de la photo dans le modèle
        await user.save();
      }

      return res
        .status(200)
        .json({ message: "Photo de profil mise à jour avec succès." });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Une erreur interne s'est produite." });
  }
};

module.exports = {
  updateProfilePhoto,
};
