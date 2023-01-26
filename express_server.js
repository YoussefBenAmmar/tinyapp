/////////////////// SET UP:


const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);
const { lookupUsersEmail, urlsForUser, generateRandomString } = require('./helpers');


// Helper functions:

// Database:
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// Setting apps, and using middleware:


app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['purple-tiger-machine-facing-grapefruit-is-impossible-to-be-too-hot-to-handle'],
  // maxAge: 24 * 60 * 60 * 1000
}));

app.use(express.urlencoded({ extended: true }));


app.use(morgan('dev'));


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

///////////////// ROUTING:


// Home page functionality and redicrection if you're not logged in
app.post("/urls", (req, res) => {
  if (req.session.user_ID) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_ID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403);
    res.send("logged in you must be, and performing this task you will be granted.");
  }
});;




app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.updatedURL;
  res.redirect("/urls");
});;


// Deleting URLs


app.post("/urls/:id/delete", (req, res) => {
  let id = req.session.user_ID;
  let shortId = req.params.id;
  let userURL = urlsForUser(id, urlDatabase);
  if (!req.session.user_ID || !userURL[shortId]) {
    res.status(403);
    res.send("You are not authorized to this. ");
  } else {
    const shortURL = req.params.id;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});


// Login action and password security:

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = lookupUsersEmail(email, users);

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_ID = user.id;
      res.redirect("/urls");
    } else {
      res.status(403);
      res.send("Infomration do not match");
    }
  }


  if (!email || !password) {
    res.status(403);
    res.send("please enter an email and/or password");
  } else {
    res.status(403);
    res.send("User does not exist");
  }

});


// Registration page action and security:

app.post("/register", (req, res) => {

  if (!req.body.email) {
    res.status(400);
    res.send('None shall pass');
  }

  if (!lookupUsersEmail(req.body.email, users)) {
    const id = generateRandomString();
    users[id] = {
      id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_ID = id;
    res.redirect("/urls");
    return;
  } else {
    res.status(400);
    res.send("Email already exists");
    return;
  }

});


// Log out:
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/urls/login");
});

// Public page with short URL:


app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


//  Home page set up:

app.get("/urls", (req, res) => {
  if (!req.session.user_ID) {
    res.status(403);
    res.send("Logged In You Must Be, See The URLs You Will.");
  }
  const id = req.session.user_ID;
  const userUrls = urlsForUser(id, urlDatabase);
  const templateVars = { urls: userUrls, user: users[id] };
  res.render("urls_index", templateVars);
});

// Registraiton page set up:

app.get("/urls/register", (req, res) => {
  if (req.session.user_ID) {
    res.redirect('/urls');
    return;
  }

  const id = req.session.user_ID;
  const templateVars = { urls: urlDatabase[id], user: users[id] };
  res.render("urls_registration", templateVars);
});


// Login page set up:
app.get("/urls/login", (req, res) => {
  if (req.session.user_ID) {
    res.redirect('/urls');
    return;
  }

  const id = req.session.user_ID;
  const templateVars = { urls: urlDatabase[id], user: users[id] };
  res.render("urls_login", templateVars);
});


// Creation of new URL set up

app.get("/urls/new", (req, res) => {
  const id = req.session.user_ID;
  if (!req.session.user_ID) {
    res.redirect('/urls/login');
  } else {
    const templateVars = { urls: urlDatabase[id], user: users[id] };
    res.render("urls_new", templateVars);
  }
});


// Page with new URL info:

app.get("/urls/:id", (req, res) => {

  const id = req.session.user_ID;
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId].longURL;
  const userURL = urlsForUser(id, urlDatabase);
  console.log("userURL:", userURL);
  const templateVars = { userURL, id: shortId, longURL, user: users[id] };

  if (!longURL) {
    res.status(404);
    res.send("This does not exist (yet?)");
  } else if (!id || !userURL[shortId]) {
    res.status(403);
    res.send("You are not authorized to check this out (yet?)");
  } else {
    res.render("urls_show", templateVars);
  }
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



// Server listen.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});