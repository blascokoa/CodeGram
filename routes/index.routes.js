const router = require("express").Router();

/* GET home page */
// router.get("/", (req, res, next) => {
//   res.render("index");
// });

const authRoutes = require("./auth.routes");
router.use("/", authRoutes);

const userRoutes = require("./user.routes");
router.use("/profile", userRoutes);

module.exports = router;
