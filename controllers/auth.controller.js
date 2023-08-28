const UserModel = require("../models/user.model");
require("dotenv").config({ path: "./config/.env" });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createToken = (id) => {
  const expiresIn = "1h"; // Durée de validité du token
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

module.exports.signUp = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    // Vérifier si un utilisateur avec cet e-mail existe déjà
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Cet e-mail est déjà associé à un compte." });
    }

    // Créer un nouvel utilisateur
    const user = await UserModel.create({
      firstname,
      lastname,
      email,
      password,
    });

    // Ne renvoyez pas le mot de passe dans la réponse
    user.password = undefined;

    res.status(201).json(user);
  } catch (error) {
    // Gérer les erreurs spécifiques
    if (error.name === "ValidationError") {
      // Les erreurs de validation de Mongoose (comme la longueur minimale du pseudo)
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      message: "Une erreur est survenue lors de la création du compte.",
    });
  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Recherche de l'utilisateur par e-mail
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email not found." });
    }

    try {
      await user.login(password); // Utilisation de la méthode login ajoutée au modèle
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    }

    // Si l'authentification réussit, générer un token
    const token = createToken(user._id);

    // Enregistrer le token dans un cookie sécurisé avec une durée de validité
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // Durée en millisecondes, ici 1 heure
    });

    // Renvoyer la réponse avec l'ID de l'utilisateur et le token
    res.status(200).json({ user: user._id, token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
};

module.exports.logout = (req, res) => {
  res.clearCookie("token"); // Supprime le cookie contenant le token
  res.status(200).json({ message: "User logged out successfully." });
};
