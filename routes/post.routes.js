const router = require("express").Router();
const postController = require("../controllers/post.controller");

router.get("/", postController.readPost);
router.post("/", postController.createPost);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);
router.patch("/like/:id", postController.likePost);

module.exports = router;
