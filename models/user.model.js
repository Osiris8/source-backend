const mongoosse = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoosse.Schema({
  pseudo: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 20,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    validate: [isEmail],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    minLength: 6,
  },
  picture: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },

  biographie: {
    type: String,
    default: "Aucune biographie disponible",
  },
  followers: {
    type: [String],
  },
  following: {
    type: [String],
  },
  likes: {
    type: [String],
  },
});

//Lancer cette fonction avant d'enregister
userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const UserModel = mongoosse.model("user", userSchema);
module.exports = UserModel;