const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");

///Auth authentification
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", auth.authenticateMiddleware, authController.logout);
router.get("/", auth.authenticateMiddleware, userController.getAllUsers);
router.get("/:id", auth.authenticateMiddleware, userController.userInfo);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.patch("/follow/:id", userController.followUser);
router.patch("/unfollow/:id", userController.unfollowUser);
module.exports = router;
