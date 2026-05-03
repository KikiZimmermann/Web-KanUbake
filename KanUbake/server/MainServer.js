require('dotenv').config({ path: __dirname + '/.env' })

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken')

app.listen(3010)
app.use(express.json())

const tests = [{username: "Daniel", test1: "Test1"},{username: "Stefan",test2:"Test2"}]

app.get('/test', authenticateToken, function (req, res) {
    res.json(tests.filter(post => post.username === req.user.name))
})

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(token == null) return res.sendStatus(401)
        
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err) return res.sendStatus(401)
           
        req.user = user
        next()
    })
}