const router = require("express").Router();
const { response } = require("express");
// const User = require("../models/User.model");
const UserModel = require("../models/User.model")
const uploader = require("../middleware/uploader")
const isLoggedIn= require("../middleware/isLoggedIn")

router.get("/", isLoggedIn, (req, res, next) =>{
    const id = req.session.user._id  //cambiar esto si queremos hacer bonus visitar otros perfiles
    UserModel.findById(id)
    .then((myProfile)=>{
        res.render("profile/profile.hbs", {myProfile})
    })
    .catch((err)=>{
        next(err)
    })
})

router.get("/edit", isLoggedIn, (req, res, next)=>{
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

router.post("/edit", uploader.single("image"), isLoggedIn, async(req, res, next)=>{
    
    const {username, name, profile_pic} = req.body
    const id = req.session.user._id
    if(req.file){
        await UserModel.findByIdAndUpdate(id, {username, name, profile_pic: req.file.path})

    }
    else{
        await UserModel.findByIdAndUpdate(id, {username, name})
    }
    
    res.redirect("/profile")
   
})

router.post("/delete", isLoggedIn, (req, res, next)=>{
    const id = req.session.user._id
    
    UserModel.findByIdAndDelete(id)
    .then(()=>{
        res.redirect("/logout")
    })
    .catch((err)=>{
        next(err)
    })

})






module.exports = router;