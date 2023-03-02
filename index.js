const express = require("express");
require("dotenv").config();
const route = require("./src/routes");
const db = require("./database");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 9999;

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
})

db.connect();

app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(express.json());  // for parsing application/json

app.use(morgan('combined'));
route(app);

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}!`);
})