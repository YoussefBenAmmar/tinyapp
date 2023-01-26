const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);


const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
};

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

const lookupUsersEmail = (email, obj) => {
  for (let i in obj) {
    if (obj[i].email === email) {
      return obj[i];
    }
  }
  return false;
};

const urlsForUser = (id, database) => {
  let userURL = {};
  for (const shortURL in database) {
    if (database[shortURL].id === id) {
      userURL[shortURL] = database[shortURL];
    }
  }
  return userURL;
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan('dev'));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  if (req.cookies.user_ID) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      id: req.cookies.id
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



app.post("/urls/:id/delete", (req, res) => {
  let id = req.cookies.user_ID;
  let shortId = req.params.id;
  let  userURL = urlsForUser(id, urlDatabase)
  if (!req.cookies.user_ID || !userURL[shortId]) {
   res.status(403);
    res.send("You are not authorized to this. ");
  } else {
    const shortURL = req.params.id;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let user = lookupUsersEmail(req.body.email, users);
  console.log("login user obj: ", user);

  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.cookie("user_ID", user.id);
      res.redirect("/urls");
    } else {
      res.status(403);
      res.send("Infomration do not match");
    }
  }
  if (!user) {
    res.status(403);
    res.send("please enter an email");
  }

});

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
    res.cookie("user_ID", id);
    res.redirect("/urls");
    return;
  } else {
    res.status(400);
    res.send("Email already exists");
    return;
  }

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  console.log("hi");
  res.redirect("/urls/login");
});


app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  if (!req.cookies.user_ID) {
    res.status(403);
    res.send("Logged In You Must Be, See The URLs You Will.");
  }
  const id = req.cookies.user_ID;
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/register", (req, res) => {
  if (req.cookies.user_ID) {
    res.redirect('/urls');
    return;
  }

  const id = req.cookies.user_ID;
  const templateVars = { urls: urlDatabase[id], user: users[id] };
  res.render("urls_registration", templateVars);
});

app.get("/urls/login", (req, res) => {
  if (req.cookies.user_ID) {
    res.redirect('/urls');
    return;
  }

  const id = req.cookies.user_ID;
  const templateVars = { urls: urlDatabase[id], user: users[id] };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_ID;
  if (!req.cookies.user_ID) {
    res.redirect('/urls/login');
  } else {
    const templateVars = { urls: urlDatabase[id], user: users[id] };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {

  const id = req.cookies.user_ID;
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  const userURL = urlsForUser(id, urlDatabase);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});