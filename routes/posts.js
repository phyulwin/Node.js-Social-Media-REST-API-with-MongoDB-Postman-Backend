const router = require('express').Router();
const Post = require('../models/Post');
const user = require('../models/User');

// router.get('/', (req, res) => {
//     res.send("Posts page");
// });

//create a post 
router.post('/', async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

//update a post
router.put('/:id', async (req, res) => { //the id is the post id
    try {
        //find the post by id
        const post = await Post.findById(req.params.id);
        //check if the post user id is the same as the request body user id
        if (post.userId === req.body.userId) {
            //update the post
            await post.updateOne({ $set: req.body });
            res.status(200).json("The post has been updated.");
        } else {
            res.status(403).json("You can update only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//delete a post
router.delete('/:id', async (req, res) => {
    try {
        //find the post by id
        const post = await Post.findById(req.params.id);
        //check if the post user id is the same as the request body user id
        if (post.userId === req.body.userId) {
            //update the post
            await post.deleteOne();
            res.status(200).json("The post has been deleted.");
        } else {
            res.status(403).json("You can delete only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//like and dislike a post
router.put('/:id/like', async (req, res) => {
    try {
        //find the post by id
        const post = await Post.findById(req.params.id);
        //check if the post has been liked by the user
        if (!post.likes.includes(req.body.userId)) {
            //update the post
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("The post has been liked.");
        } else {
            //update the post
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("The post has been disliked.");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//get a post
router.get('/:id', async (req, res) => {
    try {
        //find the post by id
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get timeline posts 
router.get('/timeline/all', async (req, res) => {
    try {
        //get the current user
        const currentUser = await user.findById(req.body.userId);
        //get the user posts
        const userPosts = await Post.find({ userId: currentUser._id });
        //get the user following posts
        const friendPosts = await Promise.all(
            //map through the user following array
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        //take all post of friends and user and put them in one array
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;