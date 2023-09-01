const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");
const uploadProfile = require("../controllers/upload.controller");
const verifyUser = require("../controllers/verifyuser.controller"); // Assurez-vous que le chemin d'importation est correct

///Auth authentification

router.get("/verify", verifyUser.verifyUser);
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", auth.authenticateMiddleware, authController.logout);
router.get("/", auth.authenticateMiddleware, userController.getAllUsers);
router.get("/:id", auth.authenticateMiddleware, userController.userInfo);
router.put("/:id", auth.authenticateMiddleware, userController.updateUser);
router.delete("/:id", auth.authenticateMiddleware, userController.deleteUser);

router.patch(
  "/follow/:id",
  auth.authenticateMiddleware,
  userController.followUser
);
router.patch(
  "/unfollow/:id",
  auth.authenticateMiddleware,
  userController.unfollowUser
);

router.put(
  "/uploadProfile/:id",
  auth.authenticateMiddleware,
  uploadProfile.updateProfilePicture
);

module.exports = router;
