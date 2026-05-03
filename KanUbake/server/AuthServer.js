require('dotenv').config({ path: __dirname + '/.env' })

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken')

app.listen(4010)
app.use(express.json())

let refreshTokens = []

app.post('/token', function (req, res){
    const refreshToken = req.body.token
    if(refreshToken == null) return res.sendStatus(401)

    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, function(err, user){
        if (err) return res.sendStatus(403)

        const accessToken = generateAccessToken({name: user.name})
        res.json({accessToken: accessToken})
    })
})

app.delete('/logout', function(req, res){
    const token = req.body.token;
    if(!token) return res.sendStatus(400)

    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post('/login', function (req, res){
    const username = req.body.username
    const user ={name: username}

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN)
    refreshTokens.push(refreshToken)
    res.json({accessToken: accessToken, refreshToken: refreshToken})
})

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '20s'})
}