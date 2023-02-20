const mongoose = require("mongoose");
require("dotenv").config();

const DB_USER = process.env.DB_USER;
const DB_PWD = process.env.DB_PWD;
const DB_NAME = process.env.DB_NAME;

const db_uri = `mongodb+srv://${DB_USER}:${DB_PWD}@cluster0.j0fbt91.mongodb.net/${DB_NAME}`;

async function connect(){

    try{
        mongoose.set('strictQuery', false);
        await mongoose.connect(db_uri);
        console.log('Connect successfully!');
    }catch(err){
        console.log(`Connect failed!. Error: ${err}`);
    }

}

module.exports = { connect };