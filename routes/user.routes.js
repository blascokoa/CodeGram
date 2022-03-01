const router = require("express").Router();
const { response } = require("express");
// const User = require("../models/User.model");
const UserModel = require("../models/User.model");
const uploader = require("../middleware/uploader");
const isLoggedIn = require("../middleware/isLoggedIn");
const Publication = require("../models/Publication.model");
const Comments = require("../models/Comment.model");

router.get("/", isLoggedIn, async (req, res, next) => {
  const id = req.session.user._id;
  const myProfile = await UserModel.findById(id);
  const myPublications = await Publication.find({
    owner: id,
  });
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
        bio,
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
  const queryPublications = await Publication.find({
    owner: id,
  });
  queryPublications.forEach((element) => {
    Publication.findByIdAndDelete(element._id).then(() => {
      return true;
    });
  });
  //Delete each like from the user
  const queryLikes = await Publication.find();
  queryLikes.forEach((element) => {
    Publication.findByIdAndUpdate(element._id, {
      $pull: { likes: req.user._id },
    }).then(() => {
      return true;
    });
  });

  const queryComments = await Comments.find({
    owner: id,
  });
  queryComments.forEach(async (element) => {
    const queryPublications = await Publication.find({ comments: element._id });
    queryPublications.forEach(async (publication) => {
      await Publication.findByIdAndUpdate(publication._id, {
        $pull: { comments: element._id },
      });
    });
    await Comments.findByIdAndDelete(element._id);
  });

  //Delete the user
  await UserModel.findByIdAndDelete(id);

  res.redirect("/logout");
  //  res.redirect("/");
});

router.post("/delete/:id", isLoggedIn, async (req, res, next) => {
  // route used by admin for delete accounts
  res.redirect("/");
});

router.get("/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  if (id === req.session.user._id) {
    res.redirect("/profile");
    return;
  }
  const queryUser = await UserModel.findById(id);

  res.render("profile/profile-id.hbs", { queryUser });
});

router.post("/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  if (id === req.session.user._id) {
    res.redirect("/profile");
    return;
  }
  const queryUser = await UserModel.findById(id);

  res.render("profile/profile-id.hbs", { queryUser });
});

module.exports = router;
