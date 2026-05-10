require('dotenv').config({ path: __dirname + '/.env' })

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const fs = require("fs");  

app.listen(3010)
app.use(express.json())

//Eine Funktion zum testen
app.get('/test', authenticateToken, function (req, res) {
    const users = JSON.parse(fs.readFileSync(__dirname + "/users.json"));
    const existingUser = users.find((user) => user.email === "testtest@gmail.com");
    res.json(existingUser);
})

//Schaut ob der Token richitig ist
function authenticateToken(req, res, next){
    //token holen
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] 

    //token testen ob richtig
    if(token == null) return res.sendStatus(401)
        
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err) return res.sendStatus(401)
           
        req.user = user //aus dem token sagen wir welcher user grad sachen macht
        next()
    })
}

