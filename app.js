//jshint esversion:6
require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });



app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/secrets", (req, res) => { 
  if(req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("login");
  }});

app.post("/register", function (req, res) { 
  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if (err) {
       console.log("err");
      res.redirect("/register")}
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      })
    }
  })
});

app.post("/login", function(req,res){
  const user= new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err)=>{
    if (err) {
      console.log("err");
  } else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    })
  }
})
});

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/logout", (req,res)=>{
  req.logout(function(err) {
    console.log("err");});
  res.redirect("/");
})

app.listen(3000, function (req, res) {
  console.log("Server is connected at port 3000");
});
