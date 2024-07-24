const dotenv = require("dotenv");
dotenv.config();

const getDbUrl = () => {
  // if (process.env.NODE_ENV.trim() === "development") {
  //   return process.env.DBURL_LOCAL;
  // } else if (process.env.NODE_ENV.trim() === "stage"){
  //   return process.env.STAGEURL;
  // } else{
  //   return process.env.PRODURL
  // }
 return "mongodb+srv://tayibulla:tayibulla@trucklink-mongo.8lbopuz.mongodb.net/trucklink?retryWrites=true&w=majority"
};

module.exports = {
  DBURL: getDbUrl(),
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  JWT_KEY: process.env.JWT_KEY,
  API_VERSION: process.env.API_VERSION,
  API_URL: process.env.API_URL
};

