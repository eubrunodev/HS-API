const mongoose = require("mongoose");
require('dotenv').config()

mongoose.connect(process.env.MONGO_URL);

mongoose.Promise = global.Promise;


module.exports = mongoose;