'use strict';

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 80      <input type="submit" value="Sign In">
const _ = require('lodash');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");

app.use(cookieSession({keys:['key1','key2']}));
app.use(bodyParser.urlencoded({extended:false}));
app.set("view engine", "ejs");

let users = {};
let urlGeneral = {};

function generateRandomString() {
  var input = "";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i=0; i <= 6; i++) {
    input += chars.charAt(Math.floor(Math.random() * chars.length));
  };
  return input;
}

// Gets:

app.get("/", (req, res) => {
  res.render("urls_main");
});

app.get("/urls", (req, res) => {
  var id = (req.session.user_id);
  let templateVars = {
    urls: users[req.session.user_id].urlDatabase,
    email: users[req.session.user_id].email
  };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
     shortURL: req.params.id,
     email: users[req.session.user_id].email
   };
     res.render("urls_new",templateVars);
});

app.get("/login/",(req, res) => {
  res.render("urls_login");
})

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    email: users[req.session.user_id].email,
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  let longURL = urlGeneral[short];
  res.redirect(longURL);
});

// Posts:

app.post("/login/", (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const user = _.find(users, {'email': email});
  if (user) {
    if (bcrypt.compareSync(password, user.password)){
        req.session.user_id = user.id
        return res.redirect("/urls");
    } else {
      res.status(403).send({error: "Incorrect Password"});
    }
    } else {
     res.status(403).send({error: "User Not Found"});
  }
  req.session.user_id = user.id;
  res.redirect("/url");
});

app.post("/urls/:id/delete", (req, res) => {
  delete users[req.session.user_id].urlDatabase[req.params.id];
  delete urlGeneral[req.params.id];
  res.redirect('/urls/');
});

app.post("/urls/:id/update", (req, res) => {
  users[req.session.user_id].urlDatabase[req.params.id] = req.body.newlongURL;
  urlGeneral[req.params.id] = req.body.newlongURL;
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/");
});

app.post("/register", (req, res) => {
  const user = _.find(users, {'email': req.body.email});
  if (user) {
    res.status(400).send({error: "User Already Registered"});
    return res.redirect("/register");
  }
  const email = req.body.email;
  const password = req.body.password;
  const hashed_password = bcrypt.hashSync(password,10);
  if (email.length == 0 || password.length == 0){
      res.status(400).send({error: "Empty Field"});
      return res.redirect("/register");
  } else {
     const userRandomID = generateRandomString();
     users[userRandomID] = {id:userRandomID, email: req.body.email, password: hashed_password, urlDatabase: {}};
     req.session.user_id = userRandomID;
     res.redirect("/");
   };
})

app.post("/urls", (req, res) => {
  const rand = generateRandomString();
  users[req.session.user_id].urlDatabase[rand] = req.body.longURL;
  urlGeneral[rand] = req.body.longURL;
  res.redirect(`/urls/${rand}`);
});

// Server:

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
