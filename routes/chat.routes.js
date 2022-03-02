const router = require("express").Router();
const ChatModel = require("../models/Chat.model");
const UserModel = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");


router.get("/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
//   const toUser = await UserModel.findById(id);
  
  const conversationFrom = await ChatModel.find({
      from: req.session.user._id,
      to: id,
  })
  .populate("from")
  .populate("to")


  const conversationTo = await ChatModel.find({
    from: id,
    to: req.session.user._id,
})
  .populate("from")
  .populate("to")



  const totalConversation = [...conversationFrom, ...conversationTo];
  
  const cleanConversation = totalConversation.sort((a, b)=>{
      if(a.createdAt < b.createdAt){
          return 1;
      } else if(a.createdAt > b.createdAt){
          return -1
      } else {
          return 0
      }
  })
  console.log( typeof cleanConversation[0].from.createdAt)


  

  res.render("chat/chat.hbs", {cleanConversation, id});
});



router.post("/:id", isLoggedIn, async (req, res, next) => {

    
   await ChatModel.create({
    from: req.session.user._id,
    to: req.params.id,
    textMessage: req.body.textMessage,
  });
  
  
  res.redirect(`/chat/${req.params.id}`)   
});







module.exports = router;
