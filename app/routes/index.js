module.exports = (app) => {
  const fs = require("fs");
  const { API_VERSION, API_URL } = require("../configure/dotenv-values");

  const routePath = "./app/routes";
  const allRoutesEntrypoint = "index.js";
  const apiUrl = API_URL + API_VERSION || "/dev/v1";
 
  fs.readdirSync(routePath).forEach(function (file) {
    if (file !== allRoutesEntrypoint) {
      app.use(apiUrl, require("./" + file));
    }
  });
};
