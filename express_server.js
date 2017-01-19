const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Add key-value pair into object:
// Redirect to /urls/shortURL

// Accepts data from input form and saves and then redirects:
app.get("/", (req, res) => {
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  let cookie = res.cookie('username', req.body.username);
  res.redirect('/urls')
});

app.get("/urls", (req, res) => {
  let locals = {
    urls: urlDatabase,
    username: req.cookies['username']
  }
  res.render("urls_index", locals);
});

app.get("/login", (req, res) => {
  res.render("urls_login")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls')
});

app.post("/urls/create", (req, res) => {
  const randomPost = generateRandomString();
  urlDatabase[randomPost] = req.body.longURL;
  res.redirect(`/urls`);
});



// Render shows the form to input data:

app.get("/urls/new", (req, res) => {
  let login = {username: req.cookies['username']
  }
  res.render("urls_new", login);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// Implement a Delete operation to remove existing URLS from database:

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.update_url;
  res.redirect('/urls')
})

// Redirects to longURL (Took us to Apple)

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls/:id", (req, res) => {
    let locals = { shortURL: req.params.id,
                   longURL: urlDatabase[req.params.id],
                   username: req.cookies['username']
                 };
  res.render("urls_show", locals);
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
    const length = 6;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};
