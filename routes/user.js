require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const session = { session: false };

// =====================================

const profile = (req, res, next) => {
    res.status(200).json({msg: "Profile", user: req.user, token: req.query.secret_token});
};

router.get("/", passport.authentication("JWT", session), profile);

//========= register a user ============

// takes authenticated req and returns res

const register = async (req, res, next) => {
    try {
        req.user.name ? res.status(201).json({msg: 'User Registered', user: req.user}): res.status(401).json({msg: "User already registered"});
    } catch (error) {
        next(error);
    }
};

router.post("/registereuser", passport.authenticate("register", session), register);

//=============== log in ===============

const login = async (req, res, next) => {
    passport.authenticate("login", (error, user) => {
        try {
            if (error) {
                res.status(500).json({msg: "Internal Server Error"});
            } else if (!user) {
                res.status(401).json({msg: "Not Authorised"});
            } else {
                const loginFn = (error) => {
                    if (error) {
                        return next(error);
                    } else {
                        const userData = {id: user.id, name: user.name};
                        const data = {user, token: jwt.sign({user: userData}, process.env.SECRET_KEY)};
                        res.status(200).json(data);
                    }
                };

                req.login(user, session, loginFn);

            }
        } catch (error) {
            return next(error);
        }
    })(req, res, next); //IFFY - Immediately Invoked Function Expression
};

router.post("/userlogin", login);

//=======================================

// all users
router.get("/", async(req, res) => {
    const allUsers = await User.findAll({
        attributes: ["id", "name", "createdAt", "updatedAt"]
    });
    res.status(200).json({data: allUsers});
});

//=========== delete all users ==========
router.delete("/", async(req, res) => {
    const allUsers = await User.destroy({truncate: true})
    res.status(200).json({msg: "All users have been removed"});
});

//======== get individual user ==========
router.get("/:name", async(req, res) => {
    const oneUser = await User.findOne({where: {name: req.params.name}, attributes: ["name", "id", "createdAt"]});
    if (oneUser <= 0){
        res.status(200).json({msg:`Could not find user. '${req.params.name}' does not exist`})
    } else {
    res.status(200).json(oneUser);
}});

//======== update a single user =========
router.put("/:id", async(req, res) => {
    const updatedUser = await User.update({name: req.body.newName}, {where: {id: req.params.id}})
    const user = await User.findOne({where: {id: req.params.id}});
    res.status(200).json({msg: user});
});

//======== delete a single user ========
router.delete("/:name", async(req, res) => {
    if (await User.findOne({where: {name: req.params.name}}) <= 0){
        res.status(200).json({msg:`Cannot delete user. '${req.params.name}' does not exist`})
    } else {
    await User.destroy({where: {name: req.params.name}});
    res.status(200).json({msg:`'${req.params.name}' has been removed`});
}});

module.exports = router; 