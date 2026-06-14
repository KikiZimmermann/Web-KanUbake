require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const path = require("path");
const app = express();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cors = require("cors");

const { registerCakeSizeApi } = require("./api/cakeSize/cakeSizeApi");
const { registerEmailApi } = require("./api/emailApi");
const { registerCakeAnalysisApi } = require("./api/cakeAnalysisApi");

app.use(express.json());

app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index/index.html"));
});

//grants permissions for browser-requests from different origins
//necssary for APIs and authentication
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  })
);

//starts API
registerCakeSizeApi(app);
registerEmailApi(app);
registerCakeAnalysisApi(app);

//Schaut ob der Token richitig ist
function authenticateToken(req, res, next) {
  //token holen
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  //token testen ob richtig
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) return res.sendStatus(401);

    req.user = user; //aus dem token sagen wir welcher user grad sachen macht
    next();
  });
}

//just rearranged
app.listen(3010, () => {
  console.log("Server running on http://localhost:3010/index/index.html");
});
