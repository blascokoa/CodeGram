const router = require("express").Router();
const UserModel = require("../models/User.model");
const Publication = require("../models/Publication.model");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/", isLoggedIn, async (req, res, next) => {
  let { lang } = req.query;
  if (lang.toLowerCase() === "javascript") {
    lang = "js";
  } else if (lang.toLowerCase() === "python") {
    lang = "py";
  }
  const languageSearch = await Publication.find({
    language: lang.toLowerCase(),
  });

  if (languageSearch.length > 0) {
      console.log(languageSearch)
      const publications = await Publication.find()
      .populate("owner");
      console.log(publications)
    res.render("search.hbs", { languageSearch, publications });
  } else {
    const publications = await Publication.find()
      .sort({ createdAt: -1 })
      .populate("owner");
const errorMessage = "there are no results for your query"
    res.render("index.hbs", { publications, errorMessage });
  }

  // UserModel.findOne({username: req.query.username})
  // .then((responsive)=>{
  //     console.log(responsive)
  //   res.render("search.hbs", {responsive})

  // })
});

module.exports = router;
