const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Add key-value pair into object:
// Redirect to /urls/shortURL

// Accepts data from input form and saves and then redirects:

app.post("/urls/create", (req, res) => {
  const randomPost = generateRandomString();
  urlDatabase[randomPost] = req.body.longURL;
  res.redirect(`/urls`);
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

// Render shows the form to input data:

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let locals = { urls: urlDatabase };
  res.render("urls_index", locals);
});

app.get("/urls/:id", (req, res) => {
    let locals = { shortURL: req.params.id,
                   longURL: urlDatabase[req.params.id]};
  res.render("urls_show", locals);
});

app.get("/", (req, res) => {
  res.redirect("/urls")
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
