//jshint esversion:6
require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const encrypt= require("mongoose-encryption");
const bcrypt = require('bcrypt');

const saltRounds = 10;
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/register", function (req, res) {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash
    });
  
    newUser.save().then(async function (data, err) {
      if (err) {
          console.error(err);
      }
      else {
          res.render("secrets");
      }
    });
});
  
});

app.post("/login", function(req,res){
  
    const username= req.body.username;
    const password= req.body.password ;

    User.findOne({email: username}).then(async function(foundUser, err){
        if (err){
            console.log(err);
        } else{
          bcrypt.compare(password, foundUser.password, function(err, result) {
            if(result===true){
              res.render("secrets");
            }
        });
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

app.listen(3000, function (req, res) {
  console.log("Server is connected at port 3000");
});
