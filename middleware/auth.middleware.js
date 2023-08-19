const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
require("dotenv").config({ path: "./config/.env" });

module.exports.authenticateMiddleware = async (req, res, next) => {
  const token = req.cookies.token; // Récupère le token depuis le cookie

  if (!token) {
    return res.status(401).json({ message: "You are not authenticated." });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decodedToken.id);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user; // Ajoute l'utilisateur au objet req pour les prochaines étapes
    next(); // Passe au middleware ou à la route suivante
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};
