const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");




//Post Routes - simplified for now
router.get("/:id", ensureAuth, postsController.getPost);

router.post("/createPost", upload.single("file"), postsController.createPost);

router.put("/likePost/:id", postsController.likePost);

router.delete("/deletePost/:id", postsController.deletePost);

router.post("/:id/comment",ensureAuth, postsController.SubmitComment);

router.get('/post/:id/comment', ensureAuth, postsController.getComments);

router.delete("/deleteComment/:postId/:commentId",ensureAuth,postsController.deleteComment);


module.exports = router;
