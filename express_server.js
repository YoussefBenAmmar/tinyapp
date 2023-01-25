const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});;


app.post("/urls/:id", (req, res) => {
  urlDatabase.longURL = req.body.updatedURL;
  res.redirect("/urls");
});;


app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  // const {email, password} = req.body
  // if (!email || !password) {
  //   return res.redirect('/urls/login');
  // } 
  // const user = lookupUsersEmail(email, users);
  // console.log(user);
  // return res.send("Hello World");
  let user = lookupUsersEmail(req.body.email, users);
  console.log("login user obj: ", user);
  if (!user) {
    res.status(403);
    res.send("please enter an email");
    return;
  }
  if (user) {
    if (user.password === req.body.password) {
      res.cookie("user_ID", user.id);
      res.redirect("/urls");
    } else {
      res.status(403);
      res.send("Infomration do not match");
    }
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
      password: req.body.password
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
  res.redirect("/urls/login");
});


app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const id = req.cookies.user_ID;
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/register", (req, res) => {
  const id = req.cookies.user_ID;
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("urls_registration", templateVars);
});

app.get("/urls/login", (req, res) => {
  const id = req.cookies.user_ID;
  const templateVars = { urls: urlDatabase, user: users[id]};
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_ID;
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  const id = req.cookies.user_ID;
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  const templateVars = { id: shortId, longURL, user: users[id] };
  res.render("urls_show", templateVars);
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});