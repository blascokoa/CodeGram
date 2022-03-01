const router = require("express").Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const Publication = require("../models/Publication.model");
const Comment = require("../models/Comment.model");

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
  console.log(req.headers);

  if (!query_publication.likes.includes(req.user._id)) {   //mirar para los followers
    await Publication.findByIdAndUpdate(id, { $push: { likes: req.user._id } });
  } else {
    await Publication.findByIdAndUpdate(id, { $pull: { likes: req.user._id } });
  }

  const origin = req.headers.referer.split("/").slice(-2);
  if (origin.includes("details")) {
    res.redirect(`/details/${origin[1]}`);
  } else {
    res.redirect("/");
  }
});

router.get("/details/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;

  // populate, doble, de dos niveles
  const query_publication = await Publication.findById(id)
    .populate("owner")
    .populate({ path: "comments", populate: { path: "owner" } });

  res.render("elements/detail.element.hbs", { query_publication });
});

router.post("/details/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (comment === "Add a comment here") {
    // Check if the comment has been edited
    const query_publication = await Publication.findById(id).populate("owner");
    const errorMessage = "Please add a message";

    res.render(`elements/detail.element.hbs`, {
      query_publication,
      errorMessage,
    });

    return;
  }
  // Store message
  const comment_id = await Comment.create({
    message: comment,
    owner: req.session.user._id,
  });
  // bind message to publication
  await Publication.findByIdAndUpdate(id, {
    $push: { comments: comment_id._id },
  });

  res.redirect(`/details/${id}`);
});

router.post("/delete/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;

  const query_publication = await Publication.findById(id).populate("owner");
  if (query_publication.owner._id.toString() === req.session.user._id) {
    await Publication.findByIdAndDelete(id);
  }
  res.redirect("/");
});

router.post("/delete_comment/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  const origin = req.headers.referer.split("/").slice(-2);

  await Publication.findByIdAndUpdate(id, { $pull: { comments: id } });
  await Comment.findByIdAndDelete(id);

  res.redirect(`/details/${origin[1]}`);
});

const authRoutes = require("./auth.routes");
router.use("/", authRoutes);

const userRoutes = require("./user.routes");
router.use("/profile", userRoutes);

module.exports = router;
