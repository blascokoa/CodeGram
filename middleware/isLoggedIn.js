module.exports = (req, res, next) => {
  // checks if the user is logged in when trying to access a specific page
  if (!req.session.user) {
    return res.render("auth/login");
  }
  req.app.locals.user = req.session.user;
  req.user = req.session.user;
  next();
};
