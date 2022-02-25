const router = require("express").Router();
const { response } = require("express");
const User = require("../models/User.model");
const UserModel = require("../models/User.model")

router.get("/", (req, res, next) =>{
    const id = req.session.user._id  //cambiar esto si queremos hacer bonus visitar otros perfiles
    UserModel.findById(id)
    .then((myProfile)=>{
        res.render("profile/profile.hbs", {myProfile})
    })
    .catch((err)=>{
        next(err)
    })
})

router.get("/edit", (req, res, next)=>{
    const id = req.session.user._id
    console.log(req.session.user)
    UserModel.findById(id)
    .then((editProfile) =>{
        res.render("profile/profile-edit.hbs", {editProfile})
        

    })
    .catch((err)=>{
        next(err)
    })

})

router.post("/edit", (req, res, next)=>{
    const {username, name, profile_pic} = req.body
    const id = req.session.user._id
    UserModel.findByIdAndUpdate(id, {name, username, profile_pic})
    .then((response) =>{
        res.redirect("/profile")
    })
    .catch((err)=>{
        next(err)
    })
   
})




module.exports = router;