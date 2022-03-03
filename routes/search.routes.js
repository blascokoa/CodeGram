const router = require("express").Router();
const UserModel = require("../models/User.model");
const Publication = require("../models/Publication.model");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/", isLoggedIn, async (req, res, next) => {
  let { searchReq } = req.query;
  if (searchReq.toLowerCase() === "javascript") {
    searchReq = "js";
  } else if (searchReq.toLowerCase() === "python") {
    searchReq = "py";
  }
  const languageSearch = await Publication.find({
    language: searchReq.toLowerCase(),
  }).populate("owner");

  const userSearch = await UserModel.find({
    username: { $regex: new RegExp(searchReq, "i") },
  });

  if (languageSearch.length > 0) {
    res.render("search.hbs", { languageSearch });
  } else if (userSearch.length > 0) {
    res.render("search.hbs", { userSearch });
  } else {
    const publications = await Publication.find()
      .sort({ createdAt: -1 })
      .populate("owner");
    const errorMessage = "there are no results for your query";
    res.render("index.hbs", { publications, errorMessage });
  }
});

module.exports = router;
