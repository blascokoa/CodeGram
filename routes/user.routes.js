const router = require("express").Router();
const { response } = require("express");
// const User = require("../models/User.model");
const UserModel = require("../models/User.model");
const uploader = require("../middleware/uploader");
const isLoggedIn = require("../middleware/isLoggedIn");
const Publication = require("../models/Publication.model");

router.get("/", isLoggedIn, (req, res, next) => {
  const id = req.session.user._id; //cambiar esto si queremos hacer bonus visitar otros perfiles
  UserModel.findById(id)
    .then((myProfile) => {
      res.render("profile/profile.hbs", { myProfile });
    })
    .catch((err) => {
      next(err);
    });
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
    const { username, name, profile_pic } = req.body;
    const id = req.session.user._id;
    if (req.file) {
      await UserModel.findByIdAndUpdate(id, {
        username,
        name,
        profile_pic: req.file.path,
      });
    } else {
      await UserModel.findByIdAndUpdate(id, { username, name });
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
  queryCodes.forEach(async (element) => {
    await Publication.findByIdAndDelete(element._id);
  });
  //Delete each like from the user
  const queryPublications = await Publication.find();
  queryPublications.forEach(async (element) => {
    await Publication.findByIdAndUpdate(element._id, {
      $pull: { likes: req.user._id },
    });
  });

  //Delete The comments  ???

  //Delete the user
  await UserModel.findByIdAndDelete(id);

  res.redirect("/logout");
  //  res.redirect("/");
});

module.exports = router;
