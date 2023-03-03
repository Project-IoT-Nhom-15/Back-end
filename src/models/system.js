const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        name: {
            type: String, required: true, trim: true
        },
        state: {
            type: String, required: true, trim: true, default: false
        },
        userID: {
            type: Schema.Types.ObjectId, required: true, trim: true, ref: 'User'
        },
    },
    {
        timestamps: true,
    }
);

const System = mongoose.model('System', schema);

module.exports = System;