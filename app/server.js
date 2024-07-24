const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const logger = require("./common/logger");
const app = express();

// secure headers
app.use(helmet());
app.use(
  helmet.referrerPolicy({
    policy: "same-origin",
  })
);

const { NODE_ENV, PORT } = process.env;

mongoose.Promise = global.Promise;

// logs of each api's with reponse time

if (NODE_ENV === "production") {
  app.use(
    require("morgan")("combined", {
      stream: logger.stream,
    })
  );
} else {
  app.use(
    require("morgan")("dev", {
      stream: logger.stream,
    })
  );
}
// tell express to use ip of request
app.set("trust proxy", true);

app.use(cors());

app.use(bodyParser.json({ limit: "5mb" }));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

//defualt route
app.get("/", (req, res) => {
  res.status(200).end("Application Started for TruckLink!!! :)");  
});

app.use("/rc-proof", express.static(path.join(__dirname, "/images")));
app.use("/invoice-doc", express.static(path.join(__dirname, "/invoice-images")));

require("./db-connection/db");
require("./db-connection/access")(app);
// require("./db-connection/errorhandler")(app);
require("./db-connection/db");
require("./routes")(app);
// const port = NODE_ENV.trim() === 'development' ? 4000 : 1988;
const port = 3000;
app.listen(port, () => logger.info(`Trucklink Dev service Listening on port ${port}`));

module.exports = app;