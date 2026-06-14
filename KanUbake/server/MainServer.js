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
const cakeService = require("./service/KuchenService");
const userService = require("./service/UserService");
const authenticateToken = require("./middleware/authenticateToken");

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


//app.use(authenticateToken); das wäre Ab hier braucht alles einen gültigen Token, um auf die Endpunkte zuzugreifen
//aber ich habe es pro route selber in meinem file gemacht
cakeService.insertCake(app);
cakeService.getCake(app);

userService.getUser(app);
userService.updateUser(app);
userService.deleteUser(app);

//just rearranged
app.listen(3010, () => {
  console.log("Server running on http://localhost:3010/index/index.html");
});
