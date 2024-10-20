const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

// Add a route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.send("Welcome to the backend server!");
});

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

app.listen(3000, () => {
    console.log("Backend server is running!");
});