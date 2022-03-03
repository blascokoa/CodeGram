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
  const myProfile = await UserModel.findById(id)
  .populate("followers").populate("followings")
  const myPublications = await Publication.find({
    owner: id,
  });
  const myProfileLimited = await UserModel.findById(id)
  .limit(10)
  .sort({ createdAt: -1 })
  .populate("followers")
  .populate("followings")
  res.render("profile/profile.hbs", {myProfile, myProfileLimited, myPublications });
});

router.get("/edit", isLoggedIn, (req, res, next) => {
  const id = req.session.user._id;
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


router.get("/followers", isLoggedIn,(req, res, next)=>{
  UserModel.findById(req.session.user._id)
  .populate("followers")
  .then((followers) =>{
    console.log(followers)
    res.render("profile/followers.hbs", {followers})

  })
  .catch((err) =>{
    next(err)
  })
  
})

router.get("/followings", isLoggedIn,(req, res, next)=>{
  UserModel.findById(req.session.user._id)
  .populate("followings")
  .then((followings) =>{
    
    res.render("profile/followings.hbs", {followings})

  })
  .catch((err) =>{
    next(err)
  })
  
})

router.get("/followers/:id", isLoggedIn,(req, res, next)=>{
  UserModel.findById(req.params.id)
  .populate("followers")
  .then((followers) =>{
    console.log(followers)
    res.render("profile/followers.hbs", {followers})

  })
  .catch((err) =>{
    next(err)
  })
  
})

router.get("/followings/:id", isLoggedIn, (req, res, next)=>{
  UserModel.findById(req.params.id)
  .populate("followings")
  .then((followings) =>{
    
    res.render("profile/followings.hbs", {followings})

  })
  .catch((err) =>{
    next(err)
  })
  
})



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
  const myPublications = await Publication.find({
    owner: id,
  });
  const myProfileLimited = await UserModel.findById(id)
  .limit(10)
  .sort({ createdAt: -1 })
  .populate("followers")
  .populate("followings")



  res.render("profile/profile-id.hbs", { queryUser, myPublications, myProfileLimited });
});

router.post("/follow/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;

  const query_user = await UserModel.findById(id);

  if (!query_user.followers.includes(req.user._id)) {
    await UserModel.findByIdAndUpdate(id, {
      $push: { followers: req.user._id },
    });
    await UserModel.findByIdAndUpdate(req.user._id, {
      $push: {followings: id}
    })
  } else {
    await UserModel.findByIdAndUpdate(id, {
      $pull: { followers: req.user._id },
    });
    await UserModel.findByIdAndUpdate(req.user._id, {
      $pull: {followings: id}
    })

    
  }

  const origin = req.headers.referer.split("/").slice(-2);
  if (origin.includes("profile")) {
    res.redirect(`/profile/${origin[1]}`);
  } else {
    res.redirect("/");
  }
});

router.post("/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  if (id === req.session.user._id) {
    res.redirect("/profile");
    return;
  }
  const queryUser = await UserModel.findById(id).populate("followers");

  res.render("profile/profile-id.hbs", { queryUser });
});




module.exports = router;
