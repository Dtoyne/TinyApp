const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(session({
  secret: "session",
  cookie: {
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}}))

// const users = {
//   user1: { id: user1, email: user1@example.com, password: hashed1 },
//   user2: { id: user2, email: user2@example.com, password: hashed2 },
//   ...
// };

const templateVars = {
  urls: urlDatabase,
  userId: '',
  email: '',
};

// Accepts data from input form and saves and then redirects:
// If userId is stored in cookies, redirect to /urls (homepage),
// Else: redirect to login page:

app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
  res.redirect("/urls");
} else {
  res.redirect('/login');
  }
});

// Get/Post Login:

app.get("/login", (req, res) => {
  const userId = req.sesssion.user_id;
  if (userId) {
    res.redirect('/');
  } else {
    res.status(200);
    res.render("urls_login");
  }
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = res.cookie('username', req.body.username);
  if (userId && bcrypt.compareSync(password, users[userId].password)) {
    req.session.user_id = userId;
    req.session.vistor_id = userId;
    res.redirect('/')
  } else {
    res.status(401);
    res.render('urls_notfound', { message: 'No matching email & password', link: '', code: 401 });
  }
});

// Get/Post Register:

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect('/');
  } else {
    res.status(200);
    res.render("urls_register");
}
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userRandomId = generateRandomString();
  const userId = _.findKey(users, ['email', email]);
  if (!email || !password) {
    res.status(400);
    res.send('Email or password are empty');
  } else if (userId) {
    res.status(400);
    res.send('Email already exists');
  } else {
    const hashedPassword = bcrypt.hashSync(password);
    users[userRandomId] = { id: userRandomId, email: email, password: hashedPassword };
    req.session.visitor_id = userRandomId;
    res.redirect('/');
  }
});

// Get User SessionID:

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    userId: '',
    email: '',
  };
  if (userId) {
    templateVars.userId = userId;
    templateVars.email = users[userId].email;
    res.status(200);
    res.render('urls_index', templateVars);
  } else {
    res.status(401)
    res.render('urls_notfound', { message: 'User is not logged in.', link: 'login', code: 401, })
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

app.post("/urls/create", (req, res) => {
  const randomPost = generateRandomString();
  urlDatabase[randomPost] = req.body.longURL;
  res.redirect(`/urls`);
});

// Render shows the form to input data:

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    let templateVars = {
      userId: userId,
      email: users[userId].email,
  };
  res.status(200);
  res.render("urls_new", templateVars);
} else {
  res.status(401);
  res.render('urls_notfound', { message: 'User is not logged in.', link: 'login', code: 401, });
}
});

// Implement a Delete operation to remove existing URLS from database:

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.update_url;
  res.redirect('/urls');
})

// Redirects to longURL (Took us to Apple)

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
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
