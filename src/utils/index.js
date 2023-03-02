const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Util = {
    generateAccessToken: (data) => {
        return jwt.sign({
            id: data._id,
            email: data.email,
            username: data.username,
        }, process.env.ACCESS_SECRET_KEY, { expiresIn: "3d" });
    },

    hashPwd: (pwd) => {
        const salt = bcrypt.genSalt(process.env.BCRYPT_SALT);
        return bcrypt.hash(pwd, salt);
    }

}

module.exports = Util;