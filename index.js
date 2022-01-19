require("dotenv").config();
const express = require("express");
const app = express();
const connection = require("./connection");
const User = require("./models/user");
const userRouter = require("./routes/user");

// app.get("/", (req, res) => res.status(200).json({msg: "Worked"}));
app.use(express.json());
app.use("/user", userRouter);

app.listen(process.env.PORT, () => {
    connection.authenticate();
    console.log("App is online");
    User.sync({alter: true});
})