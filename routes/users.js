const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.get("/", (req, res) => {
    res.send("User route is working!");
});

//update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body, //put all input data in the body
            }, { new: true });
            res.status(200).json("Account has been updated!");
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(403).json("You can update only your account!");
    }
});

//get a user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, createdAt, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            //find user which has this id (user = user that we want to follow)
            const user = await User.findById(req.params.id);
            //find current user (currentUser = user that wants to follow)
            const currentUser = await  User.findById(req.body.userId);
            
            //if user is not in the followers array
            if (!user.followers.includes(req.body.userId)) {
                //push ids to followers and followings array
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });

                res.status(200).json("User has been followed!");
            } else {
                res.status(403).json("You already follow this user!");
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    else {
        res.status(403).json("You cannot follow yourself!");
    }   
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            //find user which has this id (user = user that we want to follow)
            const user = await User.findById(req.params.id);
            //find current user (currentUser = user that wants to follow)
            const currentUser = await  User.findById(req.body.userId);
            
            //if user is in the followers array
            if (user.followers.includes(req.body.userId)) {
                //push ids to followers and followings array
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });

                res.status(200).json("User has been unfollowed!");
            } else {
                res.status(403).json("You already unfollow this user!");
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    else {
        res.status(403).json("You cannot unfollow yourself!");
    }   
});

//delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted!");
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(403).json("You can delete only your account!");
    }
});

module.exports = router;