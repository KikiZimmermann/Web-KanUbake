require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const cors = require("cors");

app.listen(4010);
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  })
);

let refreshTokens = [];

app.post("/token", function (req, res) {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, function (err, user) {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/logout", function (req, res) {
  const token = req.body.token;
  if (!token) return res.sendStatus(400);

  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

// login

app.post("/login", async function (req, res) {
  const email = req.body.email;
  // 1. read users.json
  const users = JSON.parse(fs.readFileSync(__dirname + "/users.json"));

  const existingUser = users.find((user) => user.email === email);
  if (!existingUser) {
    return res.sendStatus(401);
  }

  const passwordMatch = await bcrypt.compare(
    req.body.password,
    existingUser.password
  );
  if (!passwordMatch) {
    return res.sendStatus(401);
  }

  const user = { name: email };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN);
  refreshTokens.push(refreshToken);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "20s" });
}

// sig in
app.post("/signup", async function (req, res) {
  // 1. read users.json
  const users = JSON.parse(fs.readFileSync(__dirname + "/users.json"));
  // 2. get email, password, firstName, lastName, dateOfBirth from req.body
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const loginEmail = req.body.login_email;
  const dateOfBirth = req.body.date_of_birth;
  const loginPass = req.body.login_pass;
  const loginPassConfirm = req.body.login_pass_confirm;

  const existingUser = users.find((user) => user.email === loginEmail);
  if (existingUser) {
    return res.sendStatus(409); // 409 = Conflict — user already exists
  }

  // if we get here, user doesn't exist → create them
  const hashedPassword = await bcrypt.hash(loginPass, 10);
  const newUser = {
    firstName: firstName,
    lastName: lastName,
    email: loginEmail,
    dateOfBirth: dateOfBirth,
    password: hashedPassword,
  };
  users.push(newUser);
  fs.writeFileSync(__dirname + "/users.json", JSON.stringify(users, null, 2));
  res.sendStatus(201);
});
