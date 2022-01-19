require("dotenv").config();
const bcrypt = require("bcrypt");
const router = require("express").Router();
const User = require("../models/user");
// all users
router.get("/", async(req, res) => {
    const allUsers = await User.findAll({
        attributes: ["id", "name", "createdAt", "updatedAt"]
    });
    res.status(200).json({data: allUsers});
});
router.delete("/", async(req, res) => {
    const allUsers = await User.destroy({truncate: true})
    res.status(200).json({msg: "All users have been removed"});
});

//individual user
router.get("/:name", async(req, res) => {
    const oneUser = await User.findOne({where: {name: req.params.name}, attributes: ["name", "id", "createdAt"]});
    if (oneUser <= 0){
        res.status(200).json({msg:`Could not find user. '${req.params.name}' does not exist`})
    } else {
    res.status(200).json(oneUser);
}});
router.post("/", async(req, res) => {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
    const password = await bcrypt.hash(req.body.password, salt);
    const user = await User.create({
        name: req.body.name,
        password: req.body.password
    })
    res.status(201).json({msg: `'${req.body.name}' has been added. Password: ${password}`});
});
router.delete("/:name", async(req, res) => {
    if (await User.findOne({where: {name: req.params.name}}) <= 0){
        res.status(200).json({msg:`Cannot delete user. '${req.params.name}' does not exist`})
    } else {
    await User.destroy({where: {name: req.params.name}});
    res.status(200).json({msg:`'${req.params.name}' has been removed`});
}});
module.exports = router;