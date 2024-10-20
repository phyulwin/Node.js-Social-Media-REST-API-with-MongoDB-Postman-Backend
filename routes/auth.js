const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.get("/", (req, res) => {
    res.send("Auth route is working!");
});

// // REGISTER 
// router.get("/register", async (req, res) => {
//     try {
//         const user = new User({
//             username: "robert",
//             email: "robert@gmail.com",
//             password: "123456"
//         });
//         await user.save();
//         res.send("User created!");
//     } catch (error) {
//         res.status(500).send("Error creating user: " + error.message);
//     }
// });

// REGISTER 
router.post("/register", async (req, res) => {
    try {
        //generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });
        //save user and respond
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        //find user
        const user = await User.findOne({ email: req.body.email }); 
        !user && res.status(400).json("User not found!");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).json("Wrong password!");

        res.status(200).json(user);
    } catch (error) {        
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;