/* eslint-disable linebreak-style */
const mongoose = require("mongoose");
const logger = require("../common/logger");
const { DBURL } = require("../configure/dotenv-values");

const options = {
  auto_reconnect: true,
  reconnectTries: 60,
  reconnectInterval: 1000,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  promiseLibrary: global.Promise,
  keepAlive: 1,
  connectTimeoutMS: 30000,
};

mongoose
  .connect(DBURL || process.env.DBURL, options)
  .then(() => {
    logger.info("Connected to database!");
  })
  .catch((err) => {
    logger.error("Connection failed!", err);
  });
process.on("unhandledRejection", (error, p) => {
  //console.log('=== UNHANDLED REJECTION ===');//console.dir(error.stack);
});

module.exports = mongoose;
