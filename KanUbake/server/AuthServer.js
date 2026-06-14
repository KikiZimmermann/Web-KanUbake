// load environment variables from .env file (API keys, secrets, ports)
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express"); // web server framework
const app = express();
const jwt = require("jsonwebtoken"); // creates and verifies tokens
const bcrypt = require("bcrypt");   // hashes and compares passwords
const fs = require("fs");           // reads and writes files
const cors = require("cors");       // allows browser to talk to this server
const UserRepository = require("./repositories/UserRepository");
const db = require("./db/db");

const userRepository = new UserRepository(db);
// start the server on port 4010
app.listen(4010);

// allow the server to understand JSON data sent from the browser
app.use(express.json());

// allow requests from any origin (needed because frontend and server are on different ports)
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true); // accept all origins
    },
    credentials: true,
  })
);

// list of valid refresh tokens — stored in memory
// if server restarts, all refresh tokens are lost and users need to log in again
let refreshTokens = [];

// endpoint to get a new accessToken using a refreshToken
// called automatically when the accessToken expires (after 20 seconds)
app.post("/token", function (req, res) {
  const refreshToken = req.body.token;

  // if no refresh token was sent → not authorized
  if (refreshToken == null) return res.sendStatus(401);

  // if this refresh token is not in our list → it's invalid or was already logged out
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  // verify the refresh token is genuine and not tampered with
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, function (err, user) {
    if (err) return res.sendStatus(403);

    // create a new short-lived access token and send it back
    const accessToken = generateAccessToken({ email: user.email });
    res.json({ accessToken: accessToken });
  });
});

// endpoint to log out — removes the refresh token from the list
// without a valid refresh token, the user can't get new access tokens
app.delete("/logout", function (req, res) {
  const token = req.body.token;
  if (!token) return res.sendStatus(400);

  // remove this specific refresh token from the list
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204); // 204 = success, no content to send back
});

// endpoint to log in — checks credentials and returns tokens
app.post("/login", async function (req, res) {
  const email = req.body.email;

  // read the current list of users from the file
  const users = await userRepository.findUser();

  // check if a user with this email exists
  const existingUser = users.find((user) => user.email === email);
  if (!existingUser) {
    return res.sendStatus(401); // 401 = unauthorized — email not found
  }

  // compare the entered password with the stored hashed password
  // bcrypt.compare hashes the entered password and checks if it matches
  const passwordMatch = await bcrypt.compare(
    req.body.password,
    existingUser.password
  );
  if (!passwordMatch) {
    return res.sendStatus(401); // 401 = unauthorized — wrong password
  }

  // credentials are correct! create the user object to put in the token
  const user = { email: email };

  // create a short-lived access token (expires in 1000 seconds)
  const accessToken = generateAccessToken(user);

  // create a long-lived refresh token (expires after 7 days or by logging out)
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN, { expiresIn: "7d" });

  // save the refresh token in our list so we can validate it later
  refreshTokens.push(refreshToken);

  // send both tokens back to the browser
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

// helper function — creates a signed access token that expires in 20 seconds
// jwt.sign puts the user data inside the token and locks it with the secret key
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "1000s" });
}

// endpoint to sign up — creates a new user account
app.post("/signup", async function (req, res) {
  // get all the fields the browser sent
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const loginEmail = req.body.login_email;
  const dateOfBirth = req.body.date_of_birth;
  const loginPass = req.body.login_pass;

  // check if this email is already registered
  const existingUser = await userRepository.findUserbyEmail(loginEmail);
  if (existingUser) {
    return res.sendStatus(409); // 409 = Conflict — email already exists
  }

  // scramble the password before saving — never store plain passwords!
  // "10" = how many times bcrypt scrambles it (more = safer but slower)
  const hashedPassword = await bcrypt.hash(loginPass, 10);

  // create the new user object
  const newUser = {
    firstName: firstName,
    lastName: lastName,
    email: loginEmail,
    dateOfBirth: dateOfBirth,
    password: hashedPassword, // always save the hashed version!
  };

  await userRepository.createUser(newUser); //Datenbank

  // 201 = Created — account was successfully created
  res.sendStatus(201);
});