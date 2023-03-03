const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        username: {
            type: String, required: true, trim: true
        },
        password: {
            type: String, required: true, trim: true
        },
        email: {
            type: String, required: true, trim: true
        },
        phone: {
            type: String, required: true, trim: true
        },
        name: {
            type: String, required: true, trim: true
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', schema);

class UserDTO {
    _id;
    username;
    email;
    name;
    phone;
    createdAt;
    updatedAt;

    constructor (user){
        this._id = user._id;
        this.email = user.email;
        this.username = user.username;
        this.name = user.name;
        this.phone = user.phone;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    };
}

module.exports = {User, UserDTO};