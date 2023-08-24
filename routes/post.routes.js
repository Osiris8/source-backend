const router = require("express").Router();
const postController = require("../controllers/post.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth.authenticateMiddleware, postController.readPost);
router.post("/", auth.authenticateMiddleware, postController.createPost);
router.put("/:id", auth.authenticateMiddleware, postController.updatePost);
router.delete("/:id", auth.authenticateMiddleware, postController.deletePost);
router.patch("/like/:id", auth.authenticateMiddleware, postController.likePost);
router.patch(
  "/unlike/:id",
  auth.authenticateMiddleware,
  postController.unlikePost
);
router.patch(
  "/comment/:id",
  auth.authenticateMiddleware,
  postController.commentPost
);
router.patch(
  "/editcomment/:id",
  auth.authenticateMiddleware,
  postController.editComment
);
router.patch(
  "/deletecomment/:id",
  auth.authenticateMiddleware,
  postController.deleteComment
);

module.exports = router;
