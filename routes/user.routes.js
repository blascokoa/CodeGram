const router = require("express").Router();
const { response } = require("express");
// const User = require("../models/User.model");
const UserModel = require("../models/User.model");
const uploader = require("../middleware/uploader");
const isLoggedIn = require("../middleware/isLoggedIn");
const Publication = require("../models/Publication.model");

router.get("/", isLoggedIn, async(req, res, next) => {

  const id = req.session.user._id; 
  const myProfile = await UserModel.findById(id)
  const myPublications = await Publication.find({
    owner: id
  })
  console.log(myPublications)
  res.render("profile/profile.hbs", { myProfile, myPublications });
  
   
    
});



router.get("/edit", isLoggedIn, (req, res, next) => {
  const id = req.session.user._id;
  console.log(req.session.user);
  UserModel.findById(id)
    .then((editProfile) => {
      res.render("profile/profile-edit.hbs", { editProfile });
    })
    .catch((err) => {
      next(err);
    });
});

router.post(
  "/edit",
  uploader.single("image"),
  isLoggedIn,
  async (req, res, next) => {
    const { username, name, profile_pic, bio } = req.body;
    const id = req.session.user._id;
    if (req.file) {
      await UserModel.findByIdAndUpdate(id, {
        username,
        name,
        profile_pic: req.file.path,
        bio
      });
    } else {
      await UserModel.findByIdAndUpdate(id, { username, name, bio });
    }

    res.redirect("/profile");
  }
);

router.post("/delete", isLoggedIn, async (req, res, next) => {
  const id = req.session.user._id;
  //Delete each publication from the user
  const queryCodes = await Publication.find({
    owner: id,
  });
  queryCodes.forEach((element) => {
    Publication.findByIdAndDelete(element._id).then(() => {
      return true;
    });
  });
  //Delete each like from the user
  const queryPublications = await Publication.find();
  queryPublications.forEach((element) => {
    Publication.findByIdAndUpdate(element._id, {
      $pull: { likes: req.user._id },
    }).then(() => {
      return true;
    });
  });

  //Delete The comments  ???

  //Delete the user
  await UserModel.findByIdAndDelete(id);

  res.redirect("/logout");
  //  res.redirect("/");
});


router.get("/:id", isLoggedIn, async(req, res, next) =>{
  
  const {id} = req.params
  if(id === req.session.user._id){
    res.redirect("/profile")
    return;
  }
  const queryUser = await UserModel.findById(id)
  

  res.render("profile/profile-id.hbs", {queryUser})
  


})

module.exports = router;
