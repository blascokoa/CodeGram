// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const isAdmin = require("./utils/is_admin");
// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

hbs.registerHelper("language", function (lang) {
  switch (lang) {
    case "css":
      return "language-css";
      break;
    case "html":
      return "language-html";
      break;
    case "js":
      return "language-js";
      break;
    case "py":
      return "language-py";
      break;
    default:
      return "language-html";
      break;
  }
});

hbs.registerHelper("count", (arrayToCount)=> {
  return arrayToCount.length;
});

hbs.registerHelper("isOwner", (ownerId)=>{
  if(ownerId._id.toString() === app.locals.user._id || isAdmin(app.locals.user)){
    return "flex"
  }else{
    return "none"
  }
})

hbs.registerHelper("isOwnerMsg", (ownerId)=>{
  if(ownerId._id.toString() === app.locals.user._id || isAdmin(app.locals.user)){
    return ""
  }else{
    return "margin-left"
  }
})

hbs.registerHelper("isAdminHBS", () =>{
   if (app.locals.user.role === "admin"){
     return "flex"
   }else{
     return "none"
   }
})

hbs.registerHelper("follow", (followersArray) =>{
  if (followersArray.includes(app.locals.user._id)){
    return "UnFollow"
  }else{
    return "Follow"
  }
})

hbs.registerHelper("userLiked", (likeArray, empty)=>{
  if (likeArray.includes(app.locals.user._id)){
    if (empty){
      return "in-line"
    } else{
      return "none"
    }
  }else{
    if (empty){
      return "none"
    } else{
      return "in-line"
    }
  }
})



hbs.registerHelper("cuttingdata", (originalData)=>{
  console.log(typeof originalData)

 return originalData.toString().split(" ").slice(1, 5).join(" ")


  
}
)


const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const capitalized = require("./utils/capitalized");
const projectName = "codeGram";

app.locals.appTitle = `${capitalized(projectName)} created with IronLauncher`;

// 👇 Start handling routes here
const index = require("./routes/index.routes");
app.use("/", index);

const authRoutes = require("./routes/auth.routes");
const UserModel = require("./models/User.model");
app.use("/auth", authRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
