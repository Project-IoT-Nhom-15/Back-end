const express = require("express");
require("dotenv").config();
const route = require("./src/routes");
const db = require("./database");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 9999;

db.connect();

app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(express.json());  // for parsing application/json

app.use(morgan('combined'));
route(app);

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}!`);
})