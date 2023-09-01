const fs = require("fs");
const path = require("path");
const multer = require("multer");
const UserModel = require("../models/user.model");

// Configuration de Multer pour gérer les fichiers d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../frontend/public/uploads/profiles"); // Dossier de destination des images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extname = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extname);
  },
});

const upload = multer({ storage: storage }).single("image"); // Nom du champ de fichier dans le formulaire

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

    try {
      const userId = req.params.id;
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      // Vérifiez si l'utilisateur a déjà une photo de profil personnalisée
      if (
        user.image !==
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
      ) {
        // Supprimer l'ancienne photo de profil du dossier local
        const oldImagePath = path.join(__dirname, `../${user.image}`);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Mettez à jour le champ "image" dans le modèle user
      user.image = req.file.path.replace(/\\/g, "/");
      await user.save();

      res.status(200).json(user);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      res.status(500).json({
        message:
          "Une erreur s'est produite lors de la mise à jour de l'utilisateur.",
      });
    }
  });
};
