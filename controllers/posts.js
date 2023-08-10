const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const User = require("../models/User");





module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      if (req.query.username) {
        // Search for the user with the specified username
        const user = await User.findOne({ userName: req.query.username });

        if (!user) {
          // Handle case where user is not found
          return res.render("feed.ejs", { posts: [] });
        }

        // Find posts by the user
        const posts = await Post.find({ user: user._id });

        res.render("feed.ejs", { posts: posts });
      } else {
        // If no search query, get posts of the logged-in user
        const posts = await Post.find({ user: req.user.id });
        res.render("feed.ejs", { posts: posts });
      }
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const postId = req.params.id;

      const post = await Post.findById(postId)
        .populate('comments.user')
        .exec();

      if (!post) {
        return res.status(404).send('Post not found');
      }

      const commentCount = post.comments.length;

      res.render('post.ejs', {
        user: req.user,
        post: post,
        commentCount: commentCount, // Pass the commentCount to the view
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).send('Error fetching the post.');
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        text: 'Image',
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
  SubmitComment: async (req, res) => {
    try {
      const postId = req.params.id;
      const commentText = req.body.comment;
      const userId = req.user._id; // Storing the _id property in a variable
      console.log(userId);

      if (!commentText || !commentText.trim()) {
        return res.status(400).send('Comment cannot be empty');
      }

      // Find the post by ID
      const post = await Post.findById(postId);
      console.log(userId);


      if (!post) {
        return res.status(404).send('Post not found');
      }
      // Add the new comment to the comments array
      post.comments.push({
        text: commentText,
        userID: userId,
        date: new Date(),
      });

      post.commentCount = post.comments.length;

      console.log(userId);


      // Save the updated post with the new comment
      await post.save();
      console.log(userId);


      res.redirect(`/post/${postId}`);
    } catch (error) {
      console.error('Error saving comment:', error);
      res.status(500).send('Error saving the comment.');
    }
  },

  getComments: async (req, res) => {
    try {
      console.log("GetCommentsRAN")
      const post = await Post.findById(req.params.id)
        .populate('comments.user') // Populate the 'user' property of each comment
        .sort({ createdAt: 'desc' });
  
      if (!post) {
        return res.status(404).send('Post not found');
      }
  
      res.render('post.ejs', { post: post });
    } catch (err) {
      console.log('Error:', err);
      res.status(500).send('Internal Server Error');
    }
  },

  deleteComment: async (req, res) => {
    try {
      const postId = req.params.postId;
      const commentId = req.params.commentId;
  
      // Find the post by ID
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).send('Post not found');
      }
  
      // Find the index of the comment in the comments array
      const commentIndex = post.comments.findIndex(comment => comment.id === commentId);
  
      if (commentIndex === -1) {
        return res.status(404).send('Comment not found');
      }
  
      // Remove the comment from the array
      post.comments.splice(commentIndex, 1);
  
      // Update the comment count
      post.commentCount = post.comments.length;
  
      // Save the updated post
      await post.save();
  
      res.redirect(`post/${postId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).send('Error deleting the comment.');
    }
  }
  
};