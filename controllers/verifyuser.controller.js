const UserModel = require("../models/user.model");
require("dotenv").config({ path: "./config/.env" });
const jwt = require("jsonwebtoken");

// Contrôleur pour vérifier l'authentification de l'utilisateur
module.exports.verifyUser = async (req, res) => {
  const token = req.cookies.token; // Récupère le token depuis le cookie

  if (!token) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    // Vérifie et décode le token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Recherche l'utilisateur dans la base de données
    const user = await UserModel.findById(decodedToken.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Renvoie les informations de l'utilisateur authentifié
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};
