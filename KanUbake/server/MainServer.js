require('dotenv').config({ path: __dirname + '/.env' })

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const fs = require("fs");
const cors = require("cors");

const { registerCakeSizeApi } = require("./api/cakeSize/cakeSizeApi");
const { registerEmailApi } = require("./api/emailApi");

app.use(express.json())

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

//Eine Funktion zum testen
app.get('/test', authenticateToken, function (req, res) {
    const users = JSON.parse(fs.readFileSync(__dirname + "/users.json"));
    const existingUser = users.find((user) => user.email === req.user.email);
    res.json(existingUser);
})

//Schaut ob der Token richitig ist
function authenticateToken(req, res, next) {
    //token holen
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    //token testen ob richtig
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) return res.sendStatus(401)

        req.user = user //aus dem token sagen wir welcher user grad sachen macht
        next()
    })
}

//just rearranged
app.listen(3010, () => {
    console.log("Main server running on port 3010");
});
