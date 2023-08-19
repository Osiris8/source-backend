const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config/.env" });

const createToken = (id) => {
  const expiresIn = "1h"; // Durée de validité du token
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};
module.exports.signUp = async (req, res) => {
  const { pseudo, email, password } = req.body;
  try {
    const user = await UserModel.create({ pseudo, email, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email is not founds." });
    }

    try {
      await user.login(password); // Utilisation de la méthode login ajoutée au modèle
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    }

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // Durée en millisecondes, ici 1 heure
    });

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
