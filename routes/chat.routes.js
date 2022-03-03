const router = require("express").Router();
const ChatModel = require("../models/Chat.model");
const UserModel = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/dms", isLoggedIn, async (req, res, next) => {
  // blasc a recivido mensajes de solo una persona
  queryToMessage = await ChatModel.find({ from: req.session.user._id })
    .sort({ createdAt: -1 })
    .distinct("to");

  // Blasc22 a enviado a dos personas distintas
  queryFromMessage = await ChatModel.find({ to: req.session.user._id })
    .sort({ createdAt: -1 })
    .distinct("from");

  console.log(queryFromMessage);
  console.log(queryToMessage);

  let querySenders = await ChatModel.find({
    $or: [{ from: req.session.user._id }, { to: req.session.user._id }],
  }).sort({ createdAt: -1 });

  console.log(querySenders);
});

router.get("/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  const toUser = await UserModel.findById(id);

  const conversationFrom = await ChatModel.find({
    from: req.session.user._id,
    to: id,
  })
    .populate("from")
    .populate("to");

  const conversationTo = await ChatModel.find({
    from: id,
    to: req.session.user._id,
  })
    .populate("from")
    .populate("to");

  const totalConversation = [...conversationFrom, ...conversationTo];

  const cleanConversation = totalConversation.sort((a, b) => {
    if (a.createdAt < b.createdAt) {
      return 1;
    } else if (a.createdAt > b.createdAt) {
      return -1;
    } else {
      return 0;
    }
  });

  res.render("chat/chat.hbs", { cleanConversation, toUser });
});

router.post("/:id", isLoggedIn, async (req, res, next) => {
  await ChatModel.create({
    from: req.session.user._id,
    to: req.params.id,
    textMessage: req.body.textMessage,
  });

  res.redirect(`/chat/${req.params.id}`);
});

module.exports = router;
