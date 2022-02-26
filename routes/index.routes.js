const router = require("express").Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const Publication = require("../models/Publication.model");

/* GET home page */
router.get("/", isLoggedIn, async (req, res) => {
  const publications = await Publication.find().populate("owner");
  res.render("index.hbs", { publications });
});

router.get("/new", isLoggedIn, (req, res, next) => {
  console.log("Inside create new element");
  res.render("elements/new.element.hbs");
});

router.post("/new", isLoggedIn, async (req, res, next) => {
  const {
    newCodeElement,
    newDescriptionElement,
    htmlSelector,
    cssSelector,
    jsSelector,
    pythonSelector,
    privateButton,
  } = req.body;

  console.log(newDescriptionElement.length);

  if (newCodeElement.length < 1 && newDescriptionElement.length < 1) {
    console.log("No code or selector");
    const error = "Please fill the code and description";
    res.render("elements/new.element.hbs", { error });
  }
  console.log(htmlSelector, cssSelector, jsSelector, pythonSelector);
  if (!htmlSelector && !cssSelector && !jsSelector && !pythonSelector) {
    console.log("No code selected");
    const error = "Please select one language before post it";
    res.render("elements/new.element.hbs", { error });
  }

  let language = "";

  switch (true) {
    case htmlSelector === "on":
      language = "html";
      break;
    case cssSelector === "on":
      language = "css";
      break;
    case jsSelector === "on":
      language = "js";
      break;
    case pythonSelector === "on":
      language = "py";
      break;
  }

  console.log(language);

  await Publication.create({
    code: newCodeElement,
    description: newDescriptionElement,
    public: !!privateButton,
    language: language,
    owner: req.session.user._id,
  });

  res.redirect("/");
});

router.post("/like/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;

  const query_publication = await Publication.findById(id);
  if (!query_publication.likes.includes(req.user)) {
    console.log("User not on like list");
    await Publication.findByIdAndUpdate(id, { likes: req.user });
  }
  res.redirect("/");
});

const authRoutes = require("./auth.routes");
router.use("/", authRoutes);

const userRoutes = require("./user.routes");
router.use("/profile", userRoutes);

module.exports = router;
